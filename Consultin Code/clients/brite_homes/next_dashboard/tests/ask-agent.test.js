import { describe, it, expect, vi } from "vitest";
import { runGuardedSql } from "@/lib/ask-agent.js";
import { SQL_TOOL_DEFINITION, buildSystemPrompt } from "@/lib/ask-agent.js";

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
