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
