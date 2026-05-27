import { describe, it, expect } from "vitest";
import { preCheckSql } from "@/lib/sql-guard.js";

describe("preCheckSql", () => {
  it("accepts a plain SELECT", () => {
    expect(preCheckSql("SELECT 1").ok).toBe(true);
  });
  it("accepts a WITH (CTE) query", () => {
    expect(preCheckSql("WITH t AS (SELECT 1 AS n) SELECT n FROM t").ok).toBe(true);
  });
  it("accepts a column whose name contains a keyword substring", () => {
    expect(preCheckSql("SELECT created_date, drop_count FROM `p.d.t`").ok).toBe(true);
  });
  it("rejects empty input", () => {
    expect(preCheckSql("   ").ok).toBe(false);
  });
  it("rejects non-SELECT start", () => {
    expect(preCheckSql("DELETE FROM `p.d.t`").ok).toBe(false);
  });
  it("rejects DML/DDL keywords", () => {
    expect(preCheckSql("SELECT 1; DROP TABLE `p.d.t`").ok).toBe(false);
    expect(preCheckSql("UPDATE `p.d.t` SET x=1").ok).toBe(false);
    expect(preCheckSql("INSERT INTO `p.d.t` VALUES (1)").ok).toBe(false);
  });
  it("rejects multiple statements", () => {
    expect(preCheckSql("SELECT 1; SELECT 2").ok).toBe(false);
  });
});
import { evaluateDryRun } from "@/lib/sql-guard.js";

const cfg = {
  projectId: "proj",
  allowedDatasets: ["brite_homes_raw", "brite_homes_staging", "brite_homes_marts"],
  maxBytesScanned: 2 * 1024 ** 3,
};

describe("evaluateDryRun", () => {
  const ref = (datasetId, projectId = "proj") => ({ projectId, datasetId, tableId: "t" });

  it("accepts a SELECT on allowed datasets under the byte cap", () => {
    const res = evaluateDryRun({ statementType: "SELECT", referencedTables: [ref("brite_homes_marts")], totalBytesProcessed: 1000 }, cfg);
    expect(res.ok).toBe(true);
    expect(res.bytes).toBe(1000);
  });
  it("rejects non-SELECT statement types", () => {
    expect(evaluateDryRun({ statementType: "DELETE", referencedTables: [], totalBytesProcessed: 0 }, cfg).ok).toBe(false);
  });
  it("rejects tables outside the allowed datasets", () => {
    expect(evaluateDryRun({ statementType: "SELECT", referencedTables: [ref("other_dataset")], totalBytesProcessed: 10 }, cfg).ok).toBe(false);
  });
  it("rejects tables outside the project", () => {
    expect(evaluateDryRun({ statementType: "SELECT", referencedTables: [ref("brite_homes_marts", "evil")], totalBytesProcessed: 10 }, cfg).ok).toBe(false);
  });
  it("rejects scans over the byte cap", () => {
    expect(evaluateDryRun({ statementType: "SELECT", referencedTables: [ref("brite_homes_marts")], totalBytesProcessed: 5 * 1024 ** 3 }, cfg).ok).toBe(false);
  });
});
