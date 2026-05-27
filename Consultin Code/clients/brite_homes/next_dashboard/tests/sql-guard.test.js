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
