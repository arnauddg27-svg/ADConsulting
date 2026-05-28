#!/usr/bin/env node
/**
 * Pull the consolidated "Audits" tab from BOTH portfolio P&L sheets into
 * brite_homes_raw.audit_pl_summary.
 *
 *   Source A: Investor Audits (lender book — Casa, Genesis, Lima One, Rothstein…)
 *   Source B: BPOF Audits (Brite Properties of Florida portfolio)
 *
 * Each sheet's "Audits" tab is the bottom-line P&L: one row per job with the
 * sale price, net profit, net margin, cost rollups, and loan data already
 * computed by the operations team's formulas. We import the rendered values
 * (not the formulas) so the warehouse owns the same numbers the team trusts.
 *
 * Mapping is header-name based, so column-order skew between the two sheets
 * doesn't break the import. New columns added to the sheet are ignored;
 * deleted columns land as NULL.
 *
 * Run: node scripts/refresh-audit-pl.js
 * Add to the nightly cron alongside refresh-raw-transforms.js / create-marts.js.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { BigQuery } = require("../next_dashboard/node_modules/@google-cloud/bigquery");
const { GoogleAuth } = require("../next_dashboard/node_modules/google-auth-library");

const PROJECT_ID = process.env.BIGQUERY_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "atomic-venture-404412";
const DATASET = process.env.BIGQUERY_RAW_DATASET || "brite_homes_raw";
const TABLE = process.env.BRITE_AUDIT_PL_TABLE || "audit_pl_summary";
const DEFAULT_KEY_FILE = "/Users/arnauddurand/.config/ad-consulting/brite-homes-sa-key.json";

process.env.GOOGLE_APPLICATION_CREDENTIALS ||= DEFAULT_KEY_FILE;

const SOURCES = [
  {
    key: "investor_audits",
    sheet_id: "1AkA2Oh7qaPgRyKWYcKRPc6rKwL2E2LdjAjjtfTOad38",
    tab: "Audits",
    range: "Audits!A1:BZ400",
  },
  {
    key: "bpof_audits",
    sheet_id: "1bI8KsGH09v87wRDsDktNdYwjvE-YvTHSivr1t4bXUQQ",
    tab: "Audits",
    range: "Audits!A1:BZ400",
  },
];

// ──────────────────────────────────────────────────────────────────────────────
// Header → BigQuery column mapping. Keys are the EXACT sheet header text.
// Values are { col, type } where type ∈ STRING|FLOAT64|INT64|DATE|PERCENT.
// PERCENT is FLOAT64 but the parser strips a trailing "%" and divides by 100.
// ──────────────────────────────────────────────────────────────────────────────
const COLUMN_MAP = {
  // Identity
  "Job No":                        { col: "job_id",                         type: "STRING" },
  "Address":                       { col: "address",                        type: "STRING" },
  "Area Name":                     { col: "area_name",                      type: "STRING" },
  "Job Type":                      { col: "job_type",                       type: "STRING" },
  "Rental Status":                 { col: "rental_status",                  type: "STRING" },
  "Address City":                  { col: "city",                           type: "STRING" },
  "Sales Status":                  { col: "sales_status",                   type: "STRING" },
  "Plan Name":                     { col: "plan_name",                      type: "STRING" },
  "Furthest Milestone Completed":  { col: "furthest_milestone_completed",   type: "STRING" },
  "Lot Type":                      { col: "lot_type",                       type: "STRING" },
  "Start Date":                    { col: "start_date",                     type: "DATE" },
  "Completion Date":               { col: "completion_date",                type: "DATE" },
  "Cycle time from start":         { col: "cycle_time_days",                type: "INT64" },

  // Revenue + P&L outcomes
  "Sales Price":                   { col: "sale_price",                     type: "FLOAT64" },
  "Net Profit":                    { col: "net_profit",                     type: "FLOAT64" },
  "Net Margin":                    { col: "net_margin",                     type: "PERCENT" },
  "Proceeds":                      { col: "proceeds",                       type: "FLOAT64" },
  "BGH Total":                     { col: "bgh_total",                      type: "FLOAT64" },
  "BGH Margin":                    { col: "bgh_margin",                     type: "PERCENT" },
  "Cost To Sale":                  { col: "cost_to_sale",                   type: "FLOAT64" },

  // Cost rollups
  "Total Cost":                    { col: "total_cost",                     type: "FLOAT64" },
  "Total Direct Cost":             { col: "total_direct_cost",              type: "FLOAT64" },
  "Total Indirect Cost":           { col: "total_indirect_cost",            type: "FLOAT64" },
  "Total Direct + Financing":      { col: "total_direct_plus_financing",    type: "FLOAT64" },
  "Contigency":                    { col: "contingency",                    type: "FLOAT64" }, // sheet typo, kept verbatim
  "Correction":                    { col: "correction",                     type: "FLOAT64" },

  // Closing / Financing block
  "Seller Credit":                 { col: "seller_credit",                  type: "FLOAT64" },
  "Closing Cost":                  { col: "closing_cost",                   type: "FLOAT64" },
  "Financing":                     { col: "financing",                      type: "FLOAT64" },
  "Financing Left":                { col: "financing_left",                 type: "FLOAT64" },
  "Total Financing":               { col: "total_financing",                type: "FLOAT64" },
  "Insurance/Builder's Risk":      { col: "insurance_builder_risk",         type: "FLOAT64" },

  // Loan
  "Amount Drawn":                  { col: "amount_drawn",                   type: "FLOAT64" },
  "Loan Amount":                   { col: "loan_amount",                    type: "FLOAT64" },
  "Lender":                        { col: "lender",                         type: "STRING" },
  "Loan Closing Date":             { col: "loan_closing_date",              type: "DATE" },
  "Last Interest Payment":         { col: "last_interest_payment_date",     type: "DATE" },

  // Vertical
  "Current Vertical Budget":       { col: "current_vertical_budget",        type: "FLOAT64" },
  "Difference":                    { col: "vertical_difference",            type: "FLOAT64" },
  "Total Vertical":                { col: "total_vertical",                 type: "FLOAT64" },
  "Vertical":                      { col: "vertical",                       type: "FLOAT64" },
  "Vertial Cost Left":             { col: "vertical_cost_left",             type: "FLOAT64" }, // sheet typo, kept verbatim

  // Dirt
  "Dirt/pad Booked":               { col: "dirt_pad_booked",                type: "FLOAT64" },
  "Dirt Booked":                   { col: "dirt_pad_booked",                type: "FLOAT64" }, // BPOF variant — same target col
  "Extra Dirt":                    { col: "extra_dirt",                     type: "FLOAT64" },
  "Extra dirt":                    { col: "extra_dirt",                     type: "FLOAT64" }, // BPOF case variant
  "Dirt Total":                    { col: "dirt_total",                     type: "FLOAT64" },
  "Import Dirt":                   { col: "import_dirt",                    type: "FLOAT64" },

  // Permitting
  "Permitting":                    { col: "permitting",                     type: "FLOAT64" },
  "Budgeted Permitting":           { col: "budgeted_permitting",            type: "FLOAT64" },
  "Permitting Left":               { col: "permitting_left",                type: "FLOAT64" },
  "Permitting Total":              { col: "permitting_total",               type: "FLOAT64" },

  // Other line items
  "Lot / Land":                    { col: "lot_land",                       type: "FLOAT64" },
  "Site Work":                     { col: "site_work",                      type: "FLOAT64" },
  "Dumpsters / Portable Toilets":  { col: "dumpsters_portable_toilets",     type: "FLOAT64" },
  "Builder Fee %":                 { col: "builder_fee_pct",                type: "STRING" }, // can be "Fixed" or "11.00%"
  "Builder Fee":                   { col: "builder_fee",                    type: "FLOAT64" },
  "Options":                       { col: "options",                        type: "FLOAT64" },
  "Gopher Tortoise Survey":        { col: "gopher_tortoise_survey",         type: "FLOAT64" },

  // Utilities
  "Individual Well":               { col: "individual_well",                type: "FLOAT64" },
  "Septic System":                 { col: "septic_system",                  type: "FLOAT64" },
  "Water Filtration System":       { col: "water_filtration_system",        type: "FLOAT64" },

  // Free text
  "Notes":                         { col: "notes",                          type: "STRING" },
};

// ──────────────────────────────────────────────────────────────────────────────
// BigQuery schema (must include every COLUMN_MAP target plus provenance).
// ──────────────────────────────────────────────────────────────────────────────
const BQ_SCHEMA = {
  fields: [
    // Provenance
    { name: "_source_sheet",                type: "STRING", mode: "NULLABLE" },
    { name: "_source_sheet_id",             type: "STRING", mode: "NULLABLE" },
    { name: "_source_row",                  type: "INT64",  mode: "NULLABLE" },
    { name: "_loaded_at",                   type: "TIMESTAMP", mode: "NULLABLE" },
    // Identity
    { name: "job_id",                       type: "STRING", mode: "NULLABLE" },
    { name: "address",                      type: "STRING", mode: "NULLABLE" },
    { name: "area_name",                    type: "STRING", mode: "NULLABLE" },
    { name: "job_type",                     type: "STRING", mode: "NULLABLE" },
    { name: "rental_status",                type: "STRING", mode: "NULLABLE" },
    { name: "city",                         type: "STRING", mode: "NULLABLE" },
    { name: "sales_status",                 type: "STRING", mode: "NULLABLE" },
    { name: "plan_name",                    type: "STRING", mode: "NULLABLE" },
    { name: "furthest_milestone_completed", type: "STRING", mode: "NULLABLE" },
    { name: "lot_type",                     type: "STRING", mode: "NULLABLE" },
    { name: "start_date",                   type: "DATE",   mode: "NULLABLE" },
    { name: "completion_date",              type: "DATE",   mode: "NULLABLE" },
    { name: "cycle_time_days",              type: "INT64",  mode: "NULLABLE" },
    // Revenue + P&L
    { name: "sale_price",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "net_profit",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "net_margin",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "proceeds",                     type: "FLOAT64", mode: "NULLABLE" },
    { name: "bgh_total",                    type: "FLOAT64", mode: "NULLABLE" },
    { name: "bgh_margin",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "cost_to_sale",                 type: "FLOAT64", mode: "NULLABLE" },
    // Cost rollups
    { name: "total_cost",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "total_direct_cost",            type: "FLOAT64", mode: "NULLABLE" },
    { name: "total_indirect_cost",          type: "FLOAT64", mode: "NULLABLE" },
    { name: "total_direct_plus_financing",  type: "FLOAT64", mode: "NULLABLE" },
    { name: "contingency",                  type: "FLOAT64", mode: "NULLABLE" },
    { name: "correction",                   type: "FLOAT64", mode: "NULLABLE" },
    // Closing / Financing
    { name: "seller_credit",                type: "FLOAT64", mode: "NULLABLE" },
    { name: "closing_cost",                 type: "FLOAT64", mode: "NULLABLE" },
    { name: "financing",                    type: "FLOAT64", mode: "NULLABLE" },
    { name: "financing_left",               type: "FLOAT64", mode: "NULLABLE" },
    { name: "total_financing",              type: "FLOAT64", mode: "NULLABLE" },
    { name: "insurance_builder_risk",       type: "FLOAT64", mode: "NULLABLE" },
    // Loan
    { name: "amount_drawn",                 type: "FLOAT64", mode: "NULLABLE" },
    { name: "loan_amount",                  type: "FLOAT64", mode: "NULLABLE" },
    { name: "lender",                       type: "STRING", mode: "NULLABLE" },
    { name: "loan_closing_date",            type: "DATE",   mode: "NULLABLE" },
    { name: "last_interest_payment_date",   type: "DATE",   mode: "NULLABLE" },
    // Vertical
    { name: "current_vertical_budget",      type: "FLOAT64", mode: "NULLABLE" },
    { name: "vertical_difference",          type: "FLOAT64", mode: "NULLABLE" },
    { name: "total_vertical",               type: "FLOAT64", mode: "NULLABLE" },
    { name: "vertical",                     type: "FLOAT64", mode: "NULLABLE" },
    { name: "vertical_cost_left",           type: "FLOAT64", mode: "NULLABLE" },
    // Dirt / Permitting / Line items
    { name: "dirt_pad_booked",              type: "FLOAT64", mode: "NULLABLE" },
    { name: "extra_dirt",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "dirt_total",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "import_dirt",                  type: "FLOAT64", mode: "NULLABLE" },
    { name: "permitting",                   type: "FLOAT64", mode: "NULLABLE" },
    { name: "budgeted_permitting",          type: "FLOAT64", mode: "NULLABLE" },
    { name: "permitting_left",              type: "FLOAT64", mode: "NULLABLE" },
    { name: "permitting_total",             type: "FLOAT64", mode: "NULLABLE" },
    { name: "lot_land",                     type: "FLOAT64", mode: "NULLABLE" },
    { name: "site_work",                    type: "FLOAT64", mode: "NULLABLE" },
    { name: "dumpsters_portable_toilets",   type: "FLOAT64", mode: "NULLABLE" },
    { name: "builder_fee_pct",              type: "STRING", mode: "NULLABLE" },
    { name: "builder_fee",                  type: "FLOAT64", mode: "NULLABLE" },
    { name: "options",                      type: "FLOAT64", mode: "NULLABLE" },
    { name: "gopher_tortoise_survey",       type: "FLOAT64", mode: "NULLABLE" },
    // Utilities
    { name: "individual_well",              type: "FLOAT64", mode: "NULLABLE" },
    { name: "septic_system",                type: "FLOAT64", mode: "NULLABLE" },
    { name: "water_filtration_system",      type: "FLOAT64", mode: "NULLABLE" },
    // Free text
    { name: "notes",                        type: "STRING", mode: "NULLABLE" },
  ],
};

// ──────────────────────────────────────────────────────────────────────────────
// Parsers — currency-aware and tolerant of empty cells, dashes, "#N/A", etc.
// ──────────────────────────────────────────────────────────────────────────────
function cleanText(value) {
  return String(value ?? "").trim();
}

function isMissing(text) {
  if (!text) return true;
  const t = text.trim();
  if (!t) return true;
  // Common sheet sentinels for "empty" / "broken"
  if (t === "-" || t === "—" || t === "—-" || t === "N/A" || t === "n/a" || t === "#N/A" || t === "#REF!" || t === "#VALUE!" || t === "#DIV/0!" || t === "#NAME?" || t === "#NULL!" || t === "#NUM!") return true;
  return false;
}

function parseNumber(value) {
  const text = cleanText(value);
  if (isMissing(text)) return null;
  // Strip $ and commas; preserve sign. Handle parenthesized negatives.
  const negative = /^\(.*\)$/.test(text);
  const stripped = text.replace(/[$,]/g, "").replace(/[()]/g, "").trim();
  const match = stripped.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  if (!Number.isFinite(n)) return null;
  return negative ? -Math.abs(n) : n;
}

function parsePercent(value) {
  const text = cleanText(value);
  if (isMissing(text)) return null;
  // Strip % and parse as number; sheet already shows as e.g. "3.27%"
  const stripped = text.replace(/%/g, "").trim();
  const n = parseNumber(stripped);
  if (n === null) return null;
  // 3.27% → 0.0327
  return n / 100;
}

function parseInt64(value) {
  const n = parseNumber(value);
  if (n === null) return null;
  return Math.trunc(n);
}

function parseDate(value) {
  const text = cleanText(value);
  if (isMissing(text)) return null;
  // mm/dd/yyyy or mm/dd/yy
  const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (us) {
    const month = Number(us[1]);
    const day = Number(us[2]);
    const rawYear = Number(us[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  // yyyy-mm-dd
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  // fallback
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function parseValue(value, type) {
  switch (type) {
    case "STRING":   return cleanText(value) || null;
    case "FLOAT64":  return parseNumber(value);
    case "INT64":    return parseInt64(value);
    case "DATE":     return parseDate(value);
    case "PERCENT":  return parsePercent(value);
    default:
      throw new Error(`Unknown column type: ${type}`);
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Sheet fetch
// ──────────────────────────────────────────────────────────────────────────────
async function sheetsHeaders() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const client = await auth.getClient();
  return client.getRequestHeaders();
}

async function fetchValues(source, headers) {
  const encodedRange = encodeURIComponent(source.range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${source.sheet_id}/values/${encodedRange}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE`;
  const response = await fetch(url, { headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`Sheets API ${response.status}: ${text}`);
  return JSON.parse(text).values || [];
}

// Find the row containing "Job No" in column A — that's the header row, no
// matter how many label/spacer rows appear above it.
function findHeaderRow(values) {
  for (let i = 0; i < Math.min(values.length, 10); i++) {
    if (cleanText((values[i] || [])[0]) === "Job No") return i;
  }
  throw new Error('Could not locate the header row (no "Job No" cell in col A within first 10 rows)');
}

function normalizeRowsFromSheet(source, values) {
  const headerRowIdx = findHeaderRow(values);
  const headerRow = values[headerRowIdx] || [];
  // Build header text → column index. If a sheet has duplicate header text,
  // the LAST occurrence wins — that's usually the intended canonical column.
  const headerToCol = {};
  headerRow.forEach((h, idx) => {
    const text = cleanText(h);
    if (text) headerToCol[text] = idx;
  });

  // Verify essential columns are present
  if (!("Job No" in headerToCol)) {
    throw new Error(`${source.key}: header row missing "Job No"`);
  }

  const dataStart = headerRowIdx + 1;
  const loadedAt = new Date().toISOString();
  const output = [];
  for (let i = dataStart; i < values.length; i++) {
    const row = values[i] || [];
    const jobId = cleanText(row[headerToCol["Job No"]]);
    if (!jobId) continue; // skip blank rows
    const out = {
      _source_sheet: source.key,
      _source_sheet_id: source.sheet_id,
      _source_row: i + 1, // 1-indexed for human reference in the sheet UI
      _loaded_at: loadedAt,
    };
    for (const [header, { col, type }] of Object.entries(COLUMN_MAP)) {
      if (!(header in headerToCol)) continue;
      const cellIdx = headerToCol[header];
      const raw = row[cellIdx];
      const parsed = parseValue(raw, type);
      // Don't clobber a previously-set column with null (handles aliased headers
      // like "Dirt Booked" / "Dirt/pad Booked" both mapping to dirt_pad_booked)
      if (parsed === null && out[col] != null) continue;
      out[col] = parsed;
    }
    output.push(out);
  }
  return output;
}

// ──────────────────────────────────────────────────────────────────────────────
// BQ load
// ──────────────────────────────────────────────────────────────────────────────
async function loadRows(rows) {
  if (!rows.length) throw new Error("No rows to load.");
  const bq = new BigQuery({
    projectId: PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  const tableRef = bq.dataset(DATASET).table(TABLE);
  const tmpFile = path.join(os.tmpdir(), `brite_homes_audit_pl_${process.pid}.jsonl`);
  fs.writeFileSync(tmpFile, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  try {
    const [job] = await tableRef.load(tmpFile, {
      sourceFormat: "NEWLINE_DELIMITED_JSON",
      writeDisposition: "WRITE_TRUNCATE",
      schema: BQ_SCHEMA,
      maxBadRecords: 0,
    });
    if (job.status.errors?.length) {
      throw new Error(job.status.errors.map((e) => e.message).join("; "));
    }
  } finally {
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Audit P&L Summary → BigQuery Import ===");
  console.log(`Target: ${PROJECT_ID}.${DATASET}.${TABLE}\n`);

  const reqHeaders = await sheetsHeaders();
  const allRows = [];
  for (const source of SOURCES) {
    console.log(`Fetching ${source.key} (${source.tab}) …`);
    const values = await fetchValues(source, reqHeaders);
    if (!values.length) {
      console.log(`  ⚠ ${source.key}: 0 rows returned, skipping`);
      continue;
    }
    const rows = normalizeRowsFromSheet(source, values);
    console.log(`  ✓ ${source.key}: ${rows.length} data rows`);
    allRows.push(...rows);
  }

  if (!allRows.length) throw new Error("No data rows from any source.");

  await loadRows(allRows);

  // Summary report
  const withSale = allRows.filter((r) => r.sale_price != null && r.sale_price > 0).length;
  const withProfit = allRows.filter((r) => r.net_profit != null).length;
  const losses = allRows.filter((r) => r.net_profit != null && r.net_profit < 0).length;
  console.log("\n" + JSON.stringify({
    table: `${PROJECT_ID}.${DATASET}.${TABLE}`,
    total_rows: allRows.length,
    by_source: SOURCES.reduce((acc, s) => {
      acc[s.key] = allRows.filter((r) => r._source_sheet === s.key).length;
      return acc;
    }, {}),
    rows_with_sale_price: withSale,
    rows_with_net_profit: withProfit,
    rows_in_loss: losses,
    loaded_at: allRows[0]?._loaded_at,
  }, null, 2));
}

main().catch((error) => {
  console.error("FAILED:", error.message);
  process.exitCode = 1;
});
