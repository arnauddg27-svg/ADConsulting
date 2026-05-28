#!/usr/bin/env node
/**
 * Import the listing-agent Google Sheet into BigQuery.
 *
 * Source: listing data / Sheet503
 * Target: brite_homes_raw.listing_agent_inventory
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { BigQuery } = require("../next_dashboard/node_modules/@google-cloud/bigquery");
const { GoogleAuth } = require("../next_dashboard/node_modules/google-auth-library");

const PROJECT_ID = process.env.BIGQUERY_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || "atomic-venture-404412";
const DATASET = process.env.BIGQUERY_RAW_DATASET || "brite_homes_raw";
const TABLE = process.env.BRITE_LISTING_AGENT_TABLE || "listing_agent_inventory";
const DEFAULT_KEY_FILE = "/Users/arnauddurand/.config/ad-consulting/brite-homes-sa-key.json";
const SHEET_ID = process.env.BRITE_LISTING_AGENT_SHEET_ID || "1ZZoWHN0yVUrz-pMO2kmfHXs0nHMtI_YqEPQ6CgQjvUc";
const SHEET_NAME = process.env.BRITE_LISTING_AGENT_SHEET_NAME || "Sheet503";
const SHEET_RANGE = process.env.BRITE_LISTING_AGENT_RANGE || `${SHEET_NAME}!A1:AL`;

process.env.GOOGLE_APPLICATION_CREDENTIALS ||= DEFAULT_KEY_FILE;

function cleanText(value) {
  return String(value ?? "").trim();
}

function normalizeHeader(value, index, used) {
  const base = cleanText(value)
    .toLowerCase()
    .replace(/#/g, " number ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 110) || `column_${index + 1}`;
  let name = base;
  let suffix = 2;
  while (used.has(name)) {
    name = `${base}_${suffix}`;
    suffix += 1;
  }
  used.add(name);
  return name;
}

function valueAt(row, index) {
  return cleanText(row[index]);
}

function firstLine(value) {
  return cleanText(value).split(/\r?\n/).map((part) => part.trim()).find(Boolean) || "";
}

function parseBoolean(value) {
  const text = firstLine(value).toLowerCase();
  if (!text) return null;
  if (["true", "yes", "y", "1", "x"].includes(text)) return true;
  if (["false", "no", "n", "0"].includes(text)) return false;
  return null;
}

function parseNumber(value) {
  const text = firstLine(value);
  if (!text) return null;
  const negative = /^\(.*\)$/.test(text);
  const match = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const number = Number(match[0]);
  if (Number.isNaN(number)) return null;
  return negative ? -Math.abs(number) : number;
}

function parseDate(value) {
  const text = firstLine(value);
  if (!text) return null;

  const compact = text.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;

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

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

async function sheetsHeaders() {
  const auth = new GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  const client = await auth.getClient();
  return client.getRequestHeaders();
}

async function fetchValues() {
  const headers = await sheetsHeaders();
  const encodedRange = encodeURIComponent(SHEET_RANGE);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodedRange}?majorDimension=ROWS`;
  const response = await fetch(url, { headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`Sheets API ${response.status}: ${text}`);
  return JSON.parse(text).values || [];
}

function normalizeRows(values) {
  const headerRow = values[0] || [];
  const used = new Set();
  const rawHeaders = headerRow.map((header, index) => cleanText(header) || `Column ${index + 1}`);
  const normalizedHeaders = rawHeaders.map((header, index) => normalizeHeader(header, index, used));

  return values.slice(1)
    .map((row, rowIndex) => {
      const hasAnyValue = row.some((value) => cleanText(value));
      if (!hasAnyValue) return null;
      const raw = {};
      normalizedHeaders.forEach((header, index) => {
        raw[header] = row[index] == null ? null : String(row[index]);
      });

      return {
        source_row_number: rowIndex + 2,
        job_id: valueAt(row, 0),
        address_number: valueAt(row, 2),
        site_address: valueAt(row, 3),
        owner_of_record: valueAt(row, 4),
        sale_mls: valueAt(row, 5),
        sale_listed_date: parseDate(row[6]),
        dom: parseNumber(row[7]),
        current_price: parseNumber(row[8]),
        starting_price: parseNumber(row[9]),
        price_reduction: valueAt(row, 10),
        price_reduced_on_date: parseDate(row[11]),
        under_contract: parseBoolean(row[12]),
        effective_date: parseDate(row[13]),
        sold: parseBoolean(row[14]),
        closing_sold_date: parseDate(row[15]),
        sold_price: parseNumber(row[16]),
        listed_as_rental: parseBoolean(row[17]),
        lease_mls: valueAt(row, 18),
        leased: parseBoolean(row[19]),
        leased_date: parseDate(row[20]),
        notes: valueAt(row, 21),
        tax_id: valueAt(row, 22),
        prop_description: valueAt(row, 23),
        model_number: valueAt(row, 24),
        signor: valueAt(row, 25),
        signor_email: valueAt(row, 26),
        keybox_combo_code: valueAt(row, 27),
        listing_agent: valueAt(row, 28),
        raw_payload: JSON.stringify(raw),
        _loaded_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);
}

async function loadRows(rows) {
  const bq = new BigQuery({
    projectId: PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  const tableRef = bq.dataset(DATASET).table(TABLE);
  const tmpJsonFile = path.join(os.tmpdir(), `brite_homes_listing_agent_${process.pid}.jsonl`);
  fs.writeFileSync(tmpJsonFile, rows.map((row) => JSON.stringify(row)).join("\n") + "\n");

  const schema = {
    fields: [
      { name: "source_row_number", type: "INT64", mode: "NULLABLE" },
      { name: "job_id", type: "STRING", mode: "NULLABLE" },
      { name: "address_number", type: "STRING", mode: "NULLABLE" },
      { name: "site_address", type: "STRING", mode: "NULLABLE" },
      { name: "owner_of_record", type: "STRING", mode: "NULLABLE" },
      { name: "sale_mls", type: "STRING", mode: "NULLABLE" },
      { name: "sale_listed_date", type: "DATE", mode: "NULLABLE" },
      { name: "dom", type: "FLOAT64", mode: "NULLABLE" },
      { name: "current_price", type: "FLOAT64", mode: "NULLABLE" },
      { name: "starting_price", type: "FLOAT64", mode: "NULLABLE" },
      { name: "price_reduction", type: "STRING", mode: "NULLABLE" },
      { name: "price_reduced_on_date", type: "DATE", mode: "NULLABLE" },
      { name: "under_contract", type: "BOOL", mode: "NULLABLE" },
      { name: "effective_date", type: "DATE", mode: "NULLABLE" },
      { name: "sold", type: "BOOL", mode: "NULLABLE" },
      { name: "closing_sold_date", type: "DATE", mode: "NULLABLE" },
      { name: "sold_price", type: "FLOAT64", mode: "NULLABLE" },
      { name: "listed_as_rental", type: "BOOL", mode: "NULLABLE" },
      { name: "lease_mls", type: "STRING", mode: "NULLABLE" },
      { name: "leased", type: "BOOL", mode: "NULLABLE" },
      { name: "leased_date", type: "DATE", mode: "NULLABLE" },
      { name: "notes", type: "STRING", mode: "NULLABLE" },
      { name: "tax_id", type: "STRING", mode: "NULLABLE" },
      { name: "signor_email", type: "STRING", mode: "NULLABLE" },
      { name: "keybox_combo_code", type: "STRING", mode: "NULLABLE" },
      { name: "listing_agent", type: "STRING", mode: "NULLABLE" },
      { name: "prop_description", type: "STRING", mode: "NULLABLE" },
      { name: "model_number", type: "STRING", mode: "NULLABLE" },
      { name: "signor", type: "STRING", mode: "NULLABLE" },
      { name: "raw_payload", type: "STRING", mode: "NULLABLE" },
      { name: "_loaded_at", type: "TIMESTAMP", mode: "NULLABLE" },
    ],
  };

  try {
    const [job] = await tableRef.load(tmpJsonFile, {
      sourceFormat: "NEWLINE_DELIMITED_JSON",
      writeDisposition: "WRITE_TRUNCATE",
      schema,
      maxBadRecords: 0,
    });
    if (job.status.errors?.length) {
      throw new Error(job.status.errors.map((error) => error.message).join("; "));
    }
  } finally {
    try { fs.unlinkSync(tmpJsonFile); } catch {}
  }
}

async function main() {
  console.log("=== Listing Agent Sheet -> BigQuery Import ===");
  console.log(`Sheet: ${SHEET_ID} / ${SHEET_RANGE}`);
  console.log(`Target: ${PROJECT_ID}.${DATASET}.${TABLE}`);

  const values = await fetchValues();
  if (values.length < 2) throw new Error("Listing-agent sheet has no data rows.");
  const rows = normalizeRows(values);
  if (!rows.length) throw new Error("Listing-agent sheet rows were empty after normalization.");

  await loadRows(rows);
  const saleRows = rows.filter((row) => row.sale_mls).length;
  const rentRows = rows.filter((row) => row.listed_as_rental || row.lease_mls).length;
  console.log(JSON.stringify({
    table: `${PROJECT_ID}.${DATASET}.${TABLE}`,
    rows: rows.length,
    saleRows,
    rentRows,
    loadedAt: rows[0]?._loaded_at,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
