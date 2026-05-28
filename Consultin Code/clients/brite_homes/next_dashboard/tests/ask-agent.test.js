import { describe, it, expect, vi } from "vitest";
import { runGuardedSql } from "@/lib/ask-agent.js";
import { SQL_TOOL_DEFINITION, buildSystemPrompt } from "@/lib/ask-agent.js";
import { runAskAgent } from "@/lib/ask-agent.js";

const config = {
  projectId: "proj",
  allowedDatasets: ["brite_homes_marts", "brite_homes_raw"],
  maxBytesScanned: 2 * 1024 ** 3,
};
const okStats = { statementType: "SELECT", referencedTables: [{ projectId: "proj", datasetId: "brite_homes_marts", tableId: "v" }], totalBytesProcessed: 100 };

describe("runGuardedSql", () => {
  it("returns capped rows on the happy path", async () => {
    const dryRunFn = vi.fn(async () => okStats);
    const queryFn = vi.fn(async () => [{ city: "Austin", wip: 10 }, { city: "Dallas", wip: 20 }]);
    const res = await runGuardedSql("SELECT city, wip FROM `proj.brite_homes_marts.v`", { dryRunFn, queryFn, config, rowCap: 50 });
    expect(res.ok).toBe(true);
    expect(res.columns).toEqual(["city", "wip"]);
    expect(res.rowCount).toBe(2);
    expect(res.truncated).toBe(false);
    expect(res.bytesProcessed).toBe(100);
  });

  it("flags truncation when more rows than the cap are fetched", async () => {
    const dryRunFn = vi.fn(async () => okStats);
    const queryFn = vi.fn(async () => [{ n: 1 }, { n: 2 }, { n: 3 }]);
    const res = await runGuardedSql("SELECT n FROM `proj.brite_homes_marts.v`", { dryRunFn, queryFn, config, rowCap: 2 });
    expect(res.ok).toBe(true);
    expect(res.rowCount).toBe(2);
    expect(res.truncated).toBe(true);
  });

  it("rejects bad SQL before any dry run", async () => {
    const dryRunFn = vi.fn();
    const queryFn = vi.fn();
    const res = await runGuardedSql("DROP TABLE x", { dryRunFn, queryFn, config });
    expect(res.ok).toBe(false);
    expect(dryRunFn).not.toHaveBeenCalled();
    expect(queryFn).not.toHaveBeenCalled();
  });

  it("rejects an over-budget query before executing", async () => {
    const dryRunFn = vi.fn(async () => ({ ...okStats, totalBytesProcessed: 9 * 1024 ** 3 }));
    const queryFn = vi.fn();
    const res = await runGuardedSql("SELECT * FROM `proj.brite_homes_marts.v`", { dryRunFn, queryFn, config });
    expect(res.ok).toBe(false);
    expect(queryFn).not.toHaveBeenCalled();
  });

  it("unwraps BigQuery {value} cells", async () => {
    const dryRunFn = vi.fn(async () => okStats);
    const queryFn = vi.fn(async () => [{ d: { value: "2026-01-01" } }]);
    const res = await runGuardedSql("SELECT d FROM `proj.brite_homes_marts.v`", { dryRunFn, queryFn, config });
    expect(res.rows[0].d).toBe("2026-01-01");
  });
});

describe("SQL_TOOL_DEFINITION", () => {
  it("declares a run_sql tool requiring sql", () => {
    expect(SQL_TOOL_DEFINITION.name).toBe("run_sql");
    expect(SQL_TOOL_DEFINITION.input_schema.required).toContain("sql");
  });
});

describe("buildSystemPrompt", () => {
  it("embeds the schema and the core rules", () => {
    const prompt = buildSystemPrompt("SCHEMA_CATALOG_HERE");
    expect(prompt).toContain("run_sql");
    expect(prompt).toContain("SELECT");
    expect(prompt).toContain("SCHEMA_CATALOG_HERE");
  });
});

function scriptedStreamModel(responses) {
  let i = 0;
  return vi.fn(async ({ onText }) => {
    const r = responses[i++];
    for (const block of r.content) if (block.type === "text") onText(block.text);
    return r;
  });
}
const toolUse = (id, sql) => ({ type: "tool_use", id, name: "run_sql", input: { sql, purpose: "p" } });
const text = (t) => ({ type: "text", text: t });

describe("runAskAgent", () => {
  it("runs one query then answers (happy path)", async () => {
    const streamModel = scriptedStreamModel([
      { content: [text("Checking."), toolUse("t1", "SELECT 1")], stop_reason: "tool_use" },
      { content: [text("Answer: 1.")], stop_reason: "end_turn" },
    ]);
    const runSql = vi.fn(async () => ({ ok: true, columns: ["n"], rows: [{ n: 1 }], rowCount: 1, bytesProcessed: 50, truncated: false }));
    const events = [];
    const out = await runAskAgent({ messages: [{ role: "user", content: "q" }], schemaText: "S", streamModel, runSql, model: "m", onEvent: (e) => events.push(e) });

    expect(runSql).toHaveBeenCalledTimes(1);
    expect(out.queriesRun).toBe(1);
    expect(events.some((e) => e.type === "tool_use")).toBe(true);
    expect(events.some((e) => e.type === "tool_result")).toBe(true);
    expect(events.filter((e) => e.type === "text").map((e) => e.text).join("")).toContain("Answer: 1.");
    expect(events.at(-1).type).toBe("done");
  });

  it("stops querying once the query budget is hit and forces a final answer", async () => {
    const streamModel = scriptedStreamModel([
      { content: [toolUse("t1", "SELECT 1")], stop_reason: "tool_use" },
      { content: [text("Final answer with what I have.")], stop_reason: "end_turn" },
    ]);
    const runSql = vi.fn(async () => ({ ok: true, columns: [], rows: [], rowCount: 0, bytesProcessed: 10, truncated: false }));
    const out = await runAskAgent({ messages: [{ role: "user", content: "q" }], schemaText: "S", streamModel, runSql, model: "m", maxQueries: 1, onEvent: () => {} });

    expect(runSql).toHaveBeenCalledTimes(1);
    expect(out.queriesRun).toBe(1);
    // The final turn keeps the tool defined but forces an answer (forceAnswer => tool_choice none).
    expect(streamModel.mock.calls[1][0].forceAnswer).toBe(true);
    expect(streamModel.mock.calls[1][0].tools.length).toBe(1);
  });

  it("feeds query errors back so Claude can self-correct", async () => {
    const streamModel = scriptedStreamModel([
      { content: [toolUse("t1", "SELECT bad")], stop_reason: "tool_use" },
      { content: [toolUse("t2", "SELECT good")], stop_reason: "tool_use" },
      { content: [text("Fixed it.")], stop_reason: "end_turn" },
    ]);
    const runSql = vi.fn()
      .mockResolvedValueOnce({ ok: false, error: "bad column" })
      .mockResolvedValueOnce({ ok: true, columns: ["n"], rows: [{ n: 1 }], rowCount: 1, bytesProcessed: 10, truncated: false });
    const events = [];
    const out = await runAskAgent({ messages: [{ role: "user", content: "q" }], schemaText: "S", streamModel, runSql, model: "m", onEvent: (e) => events.push(e) });

    expect(runSql).toHaveBeenCalledTimes(2);
    expect(out.queriesRun).toBe(2);
    expect(events.some((e) => e.type === "tool_result" && e.error === "bad column")).toBe(true);
  });

  it("enforces the query budget even when one turn batches multiple tool calls", async () => {
    const streamModel = scriptedStreamModel([
      { content: [toolUse("t1", "SELECT 1"), toolUse("t2", "SELECT 2"), toolUse("t3", "SELECT 3")], stop_reason: "tool_use" },
      { content: [text("Answering with what I have.")], stop_reason: "end_turn" },
    ]);
    const runSql = vi.fn(async () => ({ ok: true, columns: ["n"], rows: [{ n: 1 }], rowCount: 1, bytesProcessed: 10, truncated: false }));
    const events = [];
    const out = await runAskAgent({ messages: [{ role: "user", content: "q" }], schemaText: "S", streamModel, runSql, model: "m", maxQueries: 2, onEvent: (e) => events.push(e) });

    expect(runSql).toHaveBeenCalledTimes(2);            // cap=2, so only 2 of the 3 batched calls execute
    expect(out.queriesRun).toBe(2);
    expect(events.filter((e) => e.type === "tool_result")).toHaveLength(3); // but every tool_use still gets a tool_result
  });

  it("always emits a final answer even when every query fails and the model writes no text", async () => {
    const streamModel = scriptedStreamModel([
      { content: [toolUse("t1", "SELECT bad")], stop_reason: "tool_use" },
      { content: [toolUse("t2", "SELECT alsobad")], stop_reason: "tool_use" },
      { content: [], stop_reason: "end_turn" }, // final (forceAnswer) turn yields no text
    ]);
    const runSql = vi.fn(async () => ({ ok: false, error: "Unrecognized name: foo" }));
    const events = [];
    await runAskAgent({ messages: [{ role: "user", content: "q" }], schemaText: "S", streamModel, runSql, model: "m", maxQueries: 2, onEvent: (e) => events.push(e) });

    const answer = events.filter((e) => e.type === "text").map((e) => e.text).join("");
    expect(answer).not.toBe(""); // a fallback answer was produced
    expect(answer).toContain("Unrecognized name: foo"); // and it surfaces the last error
    expect(events.at(-1).type).toBe("done");
  });
});
