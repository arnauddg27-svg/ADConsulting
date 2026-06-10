#!/usr/bin/env node
/**
 * FSP ERP → BigQuery Sync
 *
 * Pulls data from the Terravista ERP external API and writes to BigQuery.
 * Rebuilds raw tables (WRITE_TRUNCATE) then rebuilds mart tables via SQL.
 *
 * Usage:
 *   node sync_erp_to_bq.js              # full sync
 *   node sync_erp_to_bq.js --dry-run    # fetch only, no BQ writes
 *
 * Env vars (from ../.env or .env):
 *   FSP_API_URL                  https://fsp2.aderpsystems.com
 *   FSP_API_KEY                  External API key
 *   GOOGLE_APPLICATION_CREDENTIALS  path to service account JSON
 *   BIGQUERY_PROJECT_ID          applied-well-461916-g8
 *   BIGQUERY_RAW_DATASET         fsp_erp_test_raw
 *   BIGQUERY_MARTS_DATASET       fsp_erp_test_marts
 */

import { BigQuery } from "@google-cloud/bigquery";
import { readFileSync, writeFileSync, unlinkSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load .env ────────────────────────────────────────────────────────────────

function loadEnv() {
  for (const p of [resolve(__dirname, ".env"), resolve(__dirname, "next_dashboard/.env.local")]) {
    try {
      const lines = readFileSync(p, "utf8").split("\n");
      for (const line of lines) {
        const m = line.match(/^([A-Z_]+)=(.*)$/);
        if (m) process.env[m[1]] = m[2].trim();
      }
    } catch {}
  }
}
loadEnv();

// ── Config ───────────────────────────────────────────────────────────────────

const API_URL = process.env.FSP_API_URL || "https://fsp2.aderpsystems.com";
const API_KEY = process.env.FSP_API_KEY;
const PROJECT_ID = process.env.BIGQUERY_PROJECT_ID || "applied-well-461916-g8";
const RAW_DATASET = process.env.BIGQUERY_RAW_DATASET || "fsp_erp_test_raw";
const MARTS_DATASET = process.env.BIGQUERY_MARTS_DATASET || "fsp_erp_test_marts";
const DRY_RUN = process.argv.includes("--dry-run");

if (!API_KEY) {
  console.error("Missing FSP_API_KEY env var");
  process.exit(1);
}

const bq = new BigQuery({ projectId: PROJECT_ID });
const raw = (t) => `\`${PROJECT_ID}.${RAW_DATASET}.${t}\``;
const mart = (t) => `\`${PROJECT_ID}.${MARTS_DATASET}.${t}\``;

// ── API Helpers ──────────────────────────────────────────────────────────────

async function apiFetch(path, params = {}) {
  const url = new URL(path, API_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

async function fetchAllPages(path, params = {}) {
  const all = [];
  let page = 1;
  while (true) {
    const res = await apiFetch(path, { ...params, page, pageSize: 100 });
    all.push(...res.data);
    if (page >= res.pagination.totalPages) break;
    page++;
  }
  return all;
}

// ── BigQuery Helpers ─────────────────────────────────────────────────────────

async function truncateLoad(table, rows, schema, dataset = RAW_DATASET) {
  if (!rows.length) {
    console.log(`  ⏭  ${table}: 0 rows, skipping`);
    return;
  }
  // Write NDJSON to temp file, then load from file
  const tmpFile = resolve(tmpdir(), `bq_${table}_${Date.now()}.ndjson`);
  writeFileSync(tmpFile, rows.map((r) => JSON.stringify(r)).join("\n"));
  try {
    const [job] = await bq.dataset(dataset).table(table).createLoadJob(tmpFile, {
      sourceFormat: "NEWLINE_DELIMITED_JSON",
      writeDisposition: "WRITE_TRUNCATE",
      schema: { fields: schema },
      ignoreUnknownValues: true,
    });
    // Wait for load job to complete
    let metadata;
    while (true) {
      [metadata] = await job.getMetadata();
      if (metadata.status.state === "DONE") break;
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (metadata.status.errorResult) {
      throw new Error(`Load ${table}: ${metadata.status.errorResult.message}`);
    }
    console.log(`  ✓  ${table}: ${rows.length} rows`);
  } finally {
    try { unlinkSync(tmpFile); } catch {}
  }
}

async function runQuery(sql, label) {
  const [job] = await bq.createQueryJob({ query: sql, useLegacySql: false });
  await job.getQueryResults();
  console.log(`  ✓  ${label}`);
}

// ── Transform Helpers ────────────────────────────────────────────────────────

function ts(v) { return v || null; }
function num(v) { return v != null ? Number(v) : null; }
function str(v) { return v != null ? String(v) : null; }

// ── 1. Fetch from API ────────────────────────────────────────────────────────

async function fetchAll() {
  console.log("\n📡 Fetching from API...");

  const [projects, tasks, purchaseOrders, vendors] = await Promise.all([
    fetchAllPages("/api/external/projects"),
    fetchAllPages("/api/external/tasks", { includePurchaseOrders: true }),
    fetchAllPages("/api/external/purchase-orders"),
    fetchAllPages("/api/external/vendors"),
  ]);

  // Also fetch cost summaries per project
  console.log(`  Fetching cost summaries for ${projects.length} projects...`);
  const costSummaries = await Promise.all(
    projects.map((p) =>
      apiFetch(`/api/external/projects/${p.id}/cost-summary`).catch(() => null)
    )
  );

  console.log(`  Projects: ${projects.length}`);
  console.log(`  Tasks: ${tasks.length}`);
  console.log(`  POs: ${purchaseOrders.length}`);
  console.log(`  Vendors: ${vendors.length}`);

  return { projects, tasks, purchaseOrders, vendors, costSummaries };
}

// ── 2. Transform to BQ rows ─────────────────────────────────────────────────

function transformSchedule(projects) {
  return projects.map((p) => ({
    job_id: p.id,
    lot_id: p.lotNumber,
    job_number: p.jobNumber,
    project_address: p.address,
    short_address: p.shortAddress,
    community: p.division?.name || null,
    plan_name: p.planName,
    plan_id: p.planId,
    phase: p.phase,
    current_stage: null, // derived from tasks later
    progress_percent: num(p.progressPercent ?? p.progress_percent ?? p.milestoneProgress?.percent ?? p.milestone_progress?.percent),
    progress_milestone: str(p.progressMilestone ?? p.progress_milestone ?? p.milestoneProgress?.current ?? p.milestone_progress?.current),
    progress_matched_task_name: str(p.milestoneProgress?.matchedTaskName ?? p.milestone_progress?.matched_task_name),
    milestones_completed: num(p.milestonesCompleted ?? p.milestones_completed ?? p.milestoneProgress?.completed ?? p.milestone_progress?.completed),
    milestones_total: num(p.milestonesTotal ?? p.milestones_total ?? p.milestoneProgress?.total ?? p.milestone_progress?.total),
    start_date: ts(p.startDate),
    permit_number: p.permitNumber,
    status: p.status,
    sales_status: p.salesStatus,
    division_id: p.divisionId,
    division_code: p.division?.divisionCode || null,
    _extracted_at: new Date().toISOString(),
    _source_erp: "fsp",
  }));
}

function transformTasks(tasks) {
  return tasks.map((t) => ({
    task_id: t.id,
    task_number: t.taskNumber,
    lot_id: t.project?.id || null,
    job_id: t.project?.id || null,
    job_name: t.project?.jobNumber || null,
    project_address: t.project?.address || null,
    community: null, // resolved via join
    plan_name: t.project?.planName || null,
    stage: t.stage,
    task_group: t.taskGroup,
    activity: t.activity,
    cost_code: t.costCode,
    vendor_name: t.vendor?.name || null,
    vendor_id: t.vendor?.id || null,
    status: t.status,
    draw_status: t.drawStatus,
    is_variable: t.isVariable || false,
    cost_overridden: t.costOverridden || false,
    scheduled_start: ts(t.schedStart),
    scheduled_end: ts(t.schedEnd),
    actual_start: ts(t.actualStart),
    actual_end: ts(t.actualEnd),
    budget_cost: num(t.budgetCost),
    actual_cost: num(t.actualCost),
    duration: num(t.duration),
    notes: t.notes,
    _extracted_at: new Date().toISOString(),
    _source_erp: "fsp",
  }));
}

function transformVendorsPO(purchaseOrders) {
  return purchaseOrders.map((po) => ({
    vendor_id: po.vendor?.id || null,
    vendor_name: po.vendor?.name || null,
    po_number: po.poNumber,
    po_id: po.id,
    job_id: po.project?.id || null,
    task_id: po.task?.id || null,
    task_number: po.task?.taskNumber || null,
    activity: po.task?.activity || null,
    cost_code: po.task?.costCode || null,
    stage: po.task?.stage || null,
    task_group: po.task?.taskGroup || null,
    po_amount: num(po.amount),
    invoiced_amount: null,
    is_epo: po.isEPO || false,
    status: po.orderStatus,
    draw_status: po.drawStatus,
    is_paid: po.drawStatus === "PAID",
    issue_date: ts(po.sentAt),
    paid_at: ts(po.paidAt),
    description: po.description,
    _extracted_at: new Date().toISOString(),
    _source_erp: "fsp",
  }));
}

function transformVendorsMaster(vendors) {
  return vendors.map((v) => ({
    vendor_id: v.id,
    vendor_name: v.name,
    vendor_number: v.vendorNumber,
    short_name: v.shortName,
    contact_name: v.contactName,
    address: v.address,
    city: v.city,
    state: v.state,
    zip: v.zip,
    email: v.email,
    phone: v.phone,
    trade: v.trade,
    task_count: v._count?.tasks || 0,
    po_count: v._count?.purchaseOrders || 0,
    _extracted_at: new Date().toISOString(),
    _source_erp: "fsp",
  }));
}

function transformCostSummaries(costSummaries, projects) {
  return costSummaries
    .filter(Boolean)
    .map((cs) => {
      // API wraps in { data: { project, summary, ... } }
      const d = cs.data || cs;
      const p = projects.find((pr) => pr.id === d.project?.id);
      const s = d.summary || {};
      return {
        job_id: d.project?.id,
        project_address: d.project?.address || p?.address || null,
        community: p?.division?.name || null,
        plan_name: d.project?.planName || d.plan?.name || null,
        budget_total: num(s.budgets?.taskBudgetTotal),
        effective_actual_total: num(s.actuals?.effectiveTaskActualTotal),
        committed_po_total: num(s.purchaseOrders?.committedTotal),
        paid_po_total: num(s.purchaseOrders?.paidTotal),
        open_po_total: num(s.purchaseOrders?.openTotal),
        variance: num(s.variance?.taskBudgetMinusEffectiveActual),
        tracked_task_budget_total: num(s.budgets?.trackedTaskBudgetTotal),
        task_linked_committed_total: num(s.purchaseOrders?.taskLinkedCommittedTotal),
        erp_over_under: num(s.variance?.trackedTaskBudgetMinusTaskLinkedPOs),
        task_count: num(s.counts?.tasks),
        po_count: num(s.counts?.purchaseOrders),
        _extracted_at: new Date().toISOString(),
      };
    });
}

// ── 3. Schemas ───────────────────────────────────────────────────────────────

const SCHEDULE_SCHEMA = [
  { name: "job_id", type: "STRING" }, { name: "lot_id", type: "STRING" },
  { name: "job_number", type: "STRING" }, { name: "project_address", type: "STRING" },
  { name: "short_address", type: "STRING" }, { name: "community", type: "STRING" },
  { name: "plan_name", type: "STRING" }, { name: "plan_id", type: "STRING" },
  { name: "phase", type: "STRING" }, { name: "current_stage", type: "STRING" },
  { name: "progress_percent", type: "FLOAT" }, { name: "progress_milestone", type: "STRING" },
  { name: "progress_matched_task_name", type: "STRING" },
  { name: "milestones_completed", type: "INTEGER" }, { name: "milestones_total", type: "INTEGER" },
  { name: "start_date", type: "TIMESTAMP" }, { name: "permit_number", type: "STRING" },
  { name: "status", type: "STRING" }, { name: "sales_status", type: "STRING" },
  { name: "division_id", type: "STRING" }, { name: "division_code", type: "STRING" },
  { name: "_extracted_at", type: "TIMESTAMP" }, { name: "_source_erp", type: "STRING" },
];

const TASKS_SCHEMA = [
  { name: "task_id", type: "STRING" }, { name: "task_number", type: "STRING" },
  { name: "lot_id", type: "STRING" }, { name: "job_id", type: "STRING" },
  { name: "job_name", type: "STRING" }, { name: "project_address", type: "STRING" },
  { name: "community", type: "STRING" }, { name: "plan_name", type: "STRING" },
  { name: "stage", type: "STRING" }, { name: "task_group", type: "STRING" },
  { name: "activity", type: "STRING" }, { name: "cost_code", type: "STRING" },
  { name: "vendor_name", type: "STRING" }, { name: "vendor_id", type: "STRING" },
  { name: "status", type: "STRING" }, { name: "draw_status", type: "STRING" },
  { name: "is_variable", type: "BOOLEAN" }, { name: "cost_overridden", type: "BOOLEAN" },
  { name: "scheduled_start", type: "TIMESTAMP" }, { name: "scheduled_end", type: "TIMESTAMP" },
  { name: "actual_start", type: "TIMESTAMP" }, { name: "actual_end", type: "TIMESTAMP" },
  { name: "budget_cost", type: "FLOAT" }, { name: "actual_cost", type: "FLOAT" },
  { name: "duration", type: "FLOAT" }, { name: "notes", type: "STRING" },
  { name: "_extracted_at", type: "TIMESTAMP" }, { name: "_source_erp", type: "STRING" },
];

const VENDORS_PO_SCHEMA = [
  { name: "vendor_id", type: "STRING" }, { name: "vendor_name", type: "STRING" },
  { name: "po_number", type: "STRING" }, { name: "po_id", type: "STRING" },
  { name: "job_id", type: "STRING" }, { name: "task_id", type: "STRING" },
  { name: "task_number", type: "STRING" }, { name: "activity", type: "STRING" },
  { name: "cost_code", type: "STRING" }, { name: "stage", type: "STRING" },
  { name: "task_group", type: "STRING" },
  { name: "po_amount", type: "FLOAT" }, { name: "invoiced_amount", type: "FLOAT" },
  { name: "is_epo", type: "BOOLEAN" },
  { name: "status", type: "STRING" }, { name: "draw_status", type: "STRING" },
  { name: "is_paid", type: "BOOLEAN" },
  { name: "issue_date", type: "TIMESTAMP" }, { name: "paid_at", type: "TIMESTAMP" },
  { name: "description", type: "STRING" },
  { name: "_extracted_at", type: "TIMESTAMP" }, { name: "_source_erp", type: "STRING" },
];

const VENDORS_MASTER_SCHEMA = [
  { name: "vendor_id", type: "STRING" }, { name: "vendor_name", type: "STRING" },
  { name: "vendor_number", type: "STRING" }, { name: "short_name", type: "STRING" },
  { name: "contact_name", type: "STRING" },
  { name: "address", type: "STRING" }, { name: "city", type: "STRING" },
  { name: "state", type: "STRING" }, { name: "zip", type: "STRING" },
  { name: "email", type: "STRING" }, { name: "phone", type: "STRING" },
  { name: "trade", type: "STRING" },
  { name: "task_count", type: "INTEGER" }, { name: "po_count", type: "INTEGER" },
  { name: "_extracted_at", type: "TIMESTAMP" }, { name: "_source_erp", type: "STRING" },
];

const ACTUAL_SPENDING_SCHEMA = [
  { name: "job_id", type: "STRING" }, { name: "project_address", type: "STRING" },
  { name: "community", type: "STRING" }, { name: "plan_name", type: "STRING" },
  { name: "budget_total", type: "FLOAT" }, { name: "effective_actual_total", type: "FLOAT" },
  { name: "committed_po_total", type: "FLOAT" }, { name: "paid_po_total", type: "FLOAT" },
  { name: "open_po_total", type: "FLOAT" }, { name: "variance", type: "FLOAT" },
  { name: "tracked_task_budget_total", type: "FLOAT" }, { name: "task_linked_committed_total", type: "FLOAT" },
  { name: "erp_over_under", type: "FLOAT" },
  { name: "task_count", type: "INTEGER" }, { name: "po_count", type: "INTEGER" },
  { name: "_extracted_at", type: "TIMESTAMP" },
];

// ── 4. Rebuild Mart Tables ───────────────────────────────────────────────────

async function rebuildMarts() {
  console.log("\n🔧 Rebuilding mart tables...");

  // mart_vendor_scorecard
  await runQuery(`
    CREATE OR REPLACE TABLE ${mart("mart_vendor_scorecard")} AS
    SELECT
      vendor_id AS vendor_scorecard_key,
      vendor_id,
      vendor_name,
      SAFE_DIVIDE(
        SUM(CASE WHEN po_amount > 0 THEN po_amount ELSE 0 END) -
        SUM(CASE WHEN is_paid THEN po_amount ELSE 0 END),
        NULLIF(SUM(po_amount), 0)
      ) AS avg_variance_pct,
      SUM(COALESCE(po_amount, 0)) AS total_po_value,
      SUM(CASE WHEN is_paid THEN COALESCE(po_amount, 0) ELSE 0 END) AS total_invoiced,
      COUNTIF(status != 'CANCELLED' AND NOT is_paid) AS open_po_count,
      COUNTIF(po_amount > 0 AND status != 'CANCELLED') AS overrun_flag,
      ROW_NUMBER() OVER (ORDER BY SUM(COALESCE(po_amount, 0)) DESC) AS ranking
    FROM ${raw("vendors")}
    WHERE status != 'CANCELLED'
    GROUP BY vendor_id, vendor_name
    ORDER BY ranking
  `, "mart_vendor_scorecard");

  // mart_lot_pipeline
  await runQuery(`
    CREATE OR REPLACE TABLE ${mart("mart_lot_pipeline")} AS
    SELECT
      t.job_id,
      COALESCE(ANY_VALUE(s.progress_milestone), MAX(t.stage)) AS current_stage,
      ANY_VALUE(s.progress_percent) AS progress_percent,
      ANY_VALUE(s.progress_milestone) AS progress_milestone,
      ANY_VALUE(s.progress_matched_task_name) AS progress_matched_task_name,
      ANY_VALUE(s.milestones_completed) AS milestones_completed,
      ANY_VALUE(s.milestones_total) AS milestones_total,
      DATE_DIFF(CURRENT_DATE(), MAX(IF(t.status = 'COMPLETED' AND LOWER(TRIM(t.activity)) = LOWER(TRIM(s.progress_matched_task_name)), DATE(COALESCE(t.actual_end, t.scheduled_end)), NULL)), DAY) AS days_in_current_stage,
      COALESCE(SAFE_DIVIDE(ANY_VALUE(s.progress_percent), 100), SAFE_DIVIDE(COUNTIF(t.status = 'COMPLETED'), COUNT(*))) AS schedule_health_score
    FROM ${raw("schedule_tasks")} t
    LEFT JOIN ${raw("schedule")} s ON t.job_id = s.job_id
    GROUP BY t.job_id
  `, "mart_lot_pipeline");

  // mart_exception_center
  await runQuery(`
    CREATE OR REPLACE TABLE ${mart("mart_exception_center")} AS
    SELECT * FROM (
      -- Tasks with budget but no vendor
      SELECT
        CONCAT('no_vendor_', task_id) AS exception_center_key,
        'TASK_NO_VENDOR' AS exception_type,
        'MEDIUM' AS severity,
        CONCAT(COALESCE(project_address, job_id), ' / ', activity) AS affected_entity,
        0 AS days_outstanding
      FROM ${raw("schedule_tasks")}
      WHERE vendor_name IS NULL AND budget_cost > 0
      UNION ALL
      -- POs with no task link
      SELECT
        CONCAT('orphan_po_', po_id) AS exception_center_key,
        'PO_NO_TASK' AS exception_type,
        IF(is_epo, 'LOW', 'HIGH') AS severity,
        CONCAT(vendor_name, ' / PO#', po_number) AS affected_entity,
        DATE_DIFF(CURRENT_DATE(), DATE(issue_date), DAY) AS days_outstanding
      FROM ${raw("vendors")}
      WHERE task_id IS NULL AND status != 'CANCELLED' AND NOT is_epo
      UNION ALL
      -- Overdue tasks
      SELECT
        CONCAT('overdue_', task_id) AS exception_center_key,
        'TASK_OVERDUE' AS exception_type,
        IF(DATE_DIFF(CURRENT_DATE(), DATE(scheduled_end), DAY) > 14, 'HIGH', 'MEDIUM') AS severity,
        CONCAT(COALESCE(project_address, job_id), ' / ', activity) AS affected_entity,
        DATE_DIFF(CURRENT_DATE(), DATE(scheduled_end), DAY) AS days_outstanding
      FROM ${raw("schedule_tasks")}
      WHERE status NOT IN ('COMPLETED') AND scheduled_end IS NOT NULL AND DATE(scheduled_end) < CURRENT_DATE()
    )
  `, "mart_exception_center");

  // mart_job_profitability
  await runQuery(`
    CREATE OR REPLACE TABLE ${mart("mart_job_profitability")} AS
    SELECT
      CONCAT(t.job_id, '_', COALESCE(t.cost_code, 'NONE')) AS job_profitability_key,
      t.job_id,
      MAX(t.project_address) AS job_name,
      MAX(s.community) AS community,
      t.cost_code,
      MAX(t.activity) AS cost_code_description,
      SUM(COALESCE(t.budget_cost, 0)) AS budgeted_amount,
      SUM(COALESCE(t.actual_cost, 0)) AS actual_amount,
      COALESCE(po_agg.committed, 0) AS committed_amount,
      SUM(COALESCE(t.budget_cost, 0)) - COALESCE(po_agg.committed, 0) AS variance,
      SAFE_DIVIDE(
        COALESCE(po_agg.committed, 0) - SUM(COALESCE(t.budget_cost, 0)),
        NULLIF(SUM(COALESCE(t.budget_cost, 0)), 0)
      ) AS variance_pct,
      IF(COALESCE(po_agg.committed, 0) > SUM(COALESCE(t.budget_cost, 0)), 1, 0) AS over_budget_flag,
      GREATEST(SUM(COALESCE(t.budget_cost, 0)), COALESCE(po_agg.committed, 0)) AS projected_final_cost
    FROM ${raw("schedule_tasks")} t
    LEFT JOIN ${raw("schedule")} s ON t.job_id = s.job_id
    LEFT JOIN (
      SELECT job_id, cost_code, SUM(po_amount) AS committed
      FROM ${raw("vendors")}
      WHERE status != 'CANCELLED'
      GROUP BY job_id, cost_code
    ) po_agg ON t.job_id = po_agg.job_id AND t.cost_code = po_agg.cost_code
    GROUP BY t.job_id, t.cost_code, po_agg.committed
  `, "mart_job_profitability");

  // Enrich mart_actual_spending with dashboard-semantic columns. The loaded
  // ERP cost-summary fields (effective_actual_total, variance) keep the ERP's
  // own definitions, which differ from the dashboard's; these computed columns
  // carry the dashboard definitions so consumers don't re-derive them:
  // completed-task budget (the "Actual Spend" proxy), sent-PO budget scope,
  // and PO variance (sent scope minus committed POs).
  await runQuery(`
    CREATE OR REPLACE TABLE ${mart("mart_actual_spending")} AS
    WITH completed AS (
      SELECT job_id, SUM(COALESCE(budget_cost, 0)) AS completed_task_budget_total
      FROM ${raw("schedule_tasks")} WHERE status = 'COMPLETED' GROUP BY job_id
    ), sent AS (
      SELECT t.job_id, SUM(COALESCE(t.budget_cost, 0)) AS po_sent_budget_total
      FROM ${raw("schedule_tasks")} t
      WHERE COALESCE(t.budget_cost, 0) > 0 AND EXISTS (
        SELECT 1 FROM ${raw("vendors")} v
        WHERE v.job_id = t.job_id AND COALESCE(v.po_amount, 0) != 0
          AND LOWER(TRIM(v.vendor_name)) = LOWER(TRIM(t.vendor_name)))
      GROUP BY t.job_id
    )
    SELECT s.*,
      COALESCE(c.completed_task_budget_total, 0) AS completed_task_budget_total,
      COALESCE(p.po_sent_budget_total, 0) AS po_sent_budget_total,
      CASE WHEN COALESCE(s.committed_po_total, 0) > 0
        THEN COALESCE(p.po_sent_budget_total, 0) - s.committed_po_total ELSE 0 END AS po_variance
    FROM ${mart("mart_actual_spending")} s
    LEFT JOIN completed c USING (job_id)
    LEFT JOIN sent p USING (job_id)
  `, "mart_actual_spending enrichment");
}

// ── 5. Main ──────────────────────────────────────────────────────────────────

async function main() {
  const start = Date.now();
  console.log(`\n🚀 FSP ERP → BigQuery Sync`);
  console.log(`   API: ${API_URL}`);
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Raw: ${RAW_DATASET} | Marts: ${MARTS_DATASET}`);
  if (DRY_RUN) console.log(`   ⚠️  DRY RUN — no writes`);

  // Fetch
  const data = await fetchAll();

  if (DRY_RUN) {
    console.log("\n✅ Dry run complete");
    return;
  }

  // Transform
  console.log("\n📦 Writing raw tables...");
  const scheduleRows = transformSchedule(data.projects);
  const taskRows = transformTasks(data.tasks);
  const vendorPORows = transformVendorsPO(data.purchaseOrders);
  const vendorMasterRows = transformVendorsMaster(data.vendors);
  const spendingRows = transformCostSummaries(data.costSummaries, data.projects);

  // Load raw tables
  await truncateLoad("schedule", scheduleRows, SCHEDULE_SCHEMA);
  await truncateLoad("schedule_tasks", taskRows, TASKS_SCHEMA);
  await truncateLoad("vendors", vendorPORows, VENDORS_PO_SCHEMA);
  await truncateLoad("vendors_master", vendorMasterRows, VENDORS_MASTER_SCHEMA);

  // Load mart_actual_spending directly from API cost summaries
  await truncateLoad("mart_actual_spending", spendingRows, ACTUAL_SPENDING_SCHEMA, MARTS_DATASET);

  // Rebuild other marts
  await rebuildMarts();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n✅ Sync complete in ${elapsed}s`);
}

main().catch((err) => {
  console.error("\n❌ Sync failed:", err.message);
  console.error(err.stack);
  process.exit(1);
});
