import { describe, it, expect } from "vitest";
import { buildCatalogText } from "@/lib/warehouse-schema.js";

const datasets = { rawDataset: "brite_homes_raw", stagingDataset: "brite_homes_staging", martsDataset: "brite_homes_marts" };

const tables = [
  { table_schema: "brite_homes_marts", table_name: "v_sales_kpis", table_type: "VIEW" },
  { table_schema: "brite_homes_raw", table_name: "sales", table_type: "BASE TABLE" },
];
const columns = [
  { table_schema: "brite_homes_marts", table_name: "v_sales_kpis", column_name: "net_margin", data_type: "FLOAT64" },
  { table_schema: "brite_homes_raw", table_name: "sales", column_name: "sale_price", data_type: "NUMERIC" },
];

describe("buildCatalogText", () => {
  it("groups by dataset and marks marts as preferred", () => {
    const text = buildCatalogText({ tables, columns }, datasets);
    expect(text).toContain("brite_homes_marts");
    expect(text).toContain("PREFERRED");
    expect(text).toContain("v_sales_kpis (VIEW): net_margin FLOAT64");
    expect(text).toContain("sales (BASE TABLE): sale_price NUMERIC");
    expect(text.indexOf("brite_homes_marts")).toBeLessThan(text.indexOf("brite_homes_raw"));
  });
});

import { vi, beforeEach } from "vitest";
import { getSchemaCatalog, buildValueListText } from "@/lib/warehouse-schema.js";

describe("buildValueListText", () => {
  it("formats discovered enum values into a labeled section", () => {
    const text = buildValueListText([
      { dataset: "brite_homes_marts", table: "dim_job", column: "job_type", values: ["SFR Completed (not closed)", "SFR Construction In Progress"] },
    ]);
    expect(text).toContain("Known values for key low-cardinality fields");
    expect(text).toContain("brite_homes_marts.dim_job.job_type: SFR Completed (not closed) | SFR Construction In Progress");
  });
  it("returns empty string when there are no value lists", () => {
    expect(buildValueListText([])).toBe("");
  });
});

function makeSchemaClient({ martsFails = false, slow = false } = {}) {
  return {
    query: vi.fn(async ({ query }) => {
      if (slow) await new Promise((r) => setTimeout(r, 5));
      if (query.includes("brite_homes_marts") && query.includes("INFORMATION_SCHEMA.TABLES")) {
        if (martsFails) throw new Error("transient BigQuery error");
        return [[{ table_schema: "brite_homes_marts", table_name: "mart_x", table_type: "BASE TABLE" }]];
      }
      if (query.includes("brite_homes_marts") && query.includes("INFORMATION_SCHEMA.COLUMNS")) {
        return [[{ table_schema: "brite_homes_marts", table_name: "mart_x", column_name: "job_type", data_type: "STRING" }]];
      }
      if (query.includes("INFORMATION_SCHEMA")) return [[]]; // staging/raw present but empty
      if (query.includes("GROUP BY 1")) return [[{ v: "SFR Completed (not closed)", n: 5 }, { v: "SFR Construction In Progress", n: 10 }]];
      return [[]];
    }),
  };
}

describe("getSchemaCatalog hardening", () => {
  beforeEach(() => {
    globalThis.__briteHomesAskSchemaCache = undefined;
    process.env.BIGQUERY_PROJECT_ID = "proj";
    process.env.BIGQUERY_RAW_DATASET = "brite_homes_raw";
    process.env.BIGQUERY_MARTS_DATASET = "brite_homes_marts";
  });

  it("builds a catalog and appends value lists on success", async () => {
    const text = await getSchemaCatalog(makeSchemaClient(), { ttlMs: 10000 });
    expect(text).toContain("Dataset brite_homes_marts");
    expect(text).toContain("Known values for key low-cardinality fields");
  });

  it("does NOT cache an empty catalog when the marts query fails", async () => {
    await expect(getSchemaCatalog(makeSchemaClient({ martsFails: true }), { ttlMs: 10000 })).rejects.toThrow();
    // A subsequent successful call must rebuild (proves the failure was not cached).
    const text = await getSchemaCatalog(makeSchemaClient(), { ttlMs: 10000 });
    expect(text).toContain("Dataset brite_homes_marts");
  });

  it("coalesces concurrent cold builds into a single fetch", async () => {
    const client = makeSchemaClient({ slow: true });
    const [a, b] = await Promise.all([
      getSchemaCatalog(client, { ttlMs: 10000 }),
      getSchemaCatalog(client, { ttlMs: 10000 }),
    ]);
    expect(a).toBe(b);
    const martsTablesCalls = client.query.mock.calls.filter(
      (c) => c[0].query.includes("brite_homes_marts") && c[0].query.includes("INFORMATION_SCHEMA.TABLES"),
    ).length;
    expect(martsTablesCalls).toBe(1);
  });
});
