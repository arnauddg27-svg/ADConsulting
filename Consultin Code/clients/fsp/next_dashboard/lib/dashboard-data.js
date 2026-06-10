import { createBigQueryClient, dashboardConfig, fullyQualifiedTable, rawTable } from "./bigquery.js";

function normalizeRow(row) {
  return JSON.parse(JSON.stringify(row));
}

async function queryRows(client, query) {
  const [rows] = await client.query({ query });
  return rows.map(normalizeRow);
}

async function queryFirstRow(client, query) {
  const rows = await queryRows(client, query);
  return normalizeRow(rows[0] ?? {});
}

function sanitizeErrorMessage(message) {
  return String(message || "")
    .replace(/\/Users\/[^,\s)]+/g, "[local file path]")
    .replace(/\/var\/folders\/[^,\s)]+/g, "[local file path]")
    .replace(/\/private\/var\/folders\/[^,\s)]+/g, "[local file path]");
}

function safeNumber(v) {
  return v == null || Number.isNaN(Number(v)) ? 0 : Number(v);
}

function normalizeTemporalValue(v) {
  if (v == null) return null;
  if (typeof v === "object" && "value" in v) return v.value ?? null;
  return v;
}

function toneFromCoverage(c) {
  if (c >= 0.85) return "good";
  if (c >= 0.35) return "watch";
  return "alert";
}

function buildUnavailableDashboard(message) {
  const config = dashboardConfig();
  return {
    sourceMode: "live",
    errorMessage: message,
    config,
    summaries: {
      portfolio: { totalJobs: 0, totalTasks: 0, completedTasks: 0, totalBudget: 0, distinctPlans: 0 },
      construction: { tasksByStatus: {}, jobsWithProgress: 0, avgCompletionPct: 0 },
      vendors: { totalVendors: 0, totalPoValue: 0, totalPos: 0 },
      exceptions: { totalExceptions: 0, highSeverity: 0 },
    },
    jobProgress: [],
    tasksByStage: [],
    tasksByGroup: [],
    taskRoster: [],
    vendorScorecard: [],
    vendorPoDetail: [],
    exceptionRows: [],
    actualSpending: [],
    qualityChecks: [],
    auditNotes: ["The dashboard could not reach BigQuery."],
  };
}

export async function getDashboardData() {
  const config = dashboardConfig();
  const scheduleT = rawTable("schedule");
  const tasksT = rawTable("schedule_tasks");
  const vendorsT = rawTable("vendors");
  const exceptionT = fullyQualifiedTable("mart_exception_center");
  const vendorScoreT = fullyQualifiedTable("mart_vendor_scorecard");
  const pipelineT = fullyQualifiedTable("mart_lot_pipeline");
  const spendingT = fullyQualifiedTable("mart_actual_spending");

  try {
    const client = createBigQueryClient();

    // Schema guard: the ERP milestone columns on `schedule` can disappear if a
    // legacy ingestion job overwrites the table. Probe before referencing them
    // so the dashboard degrades to task-derived progress instead of erroring.
    let scheduleColumns = new Set();
    try {
      const colRows = await queryRows(client, `
        SELECT column_name
        FROM \`${config.projectId}.${config.rawDataset}\`.INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'schedule'
      `);
      scheduleColumns = new Set(colRows.map((r) => r.column_name));
    } catch {
      scheduleColumns = new Set();
    }
    // Milestone fields prefer raw `schedule`, then `mart_lot_pipeline`, then a
    // task-completion ratio. The mart fallback matters: an ERP-managed job
    // (`fsp-erp-test-ingestion`, runs hourly 7am-noon ET) rewrites raw
    // `schedule` with a legacy schema that has no milestone columns, while the
    // marts are rebuilt only by the 6:00 AM fsp-erp-sync and stay intact all
    // day. Without the mart fallback, milestone progress silently degrades to
    // task ratios every morning after 7am.
    const taskRatioExpr = "ROUND(100 * SAFE_DIVIDE(COUNTIF(t.status = 'COMPLETED'), COUNT(*)), 1)";
    const progressPercentExpr = scheduleColumns.has("progress_percent")
      ? `COALESCE(ANY_VALUE(s.progress_percent), ANY_VALUE(p.progress_percent), ${taskRatioExpr})`
      : `COALESCE(ANY_VALUE(p.progress_percent), ${taskRatioExpr})`;
    const progressMilestoneExpr = scheduleColumns.has("progress_milestone")
      ? "COALESCE(ANY_VALUE(s.progress_milestone), ANY_VALUE(p.progress_milestone), ANY_VALUE(s.current_stage), ANY_VALUE(p.current_stage))"
      : "COALESCE(ANY_VALUE(p.progress_milestone), ANY_VALUE(s.current_stage), ANY_VALUE(p.current_stage))";
    const matchedTaskExpr = scheduleColumns.has("progress_matched_task_name")
      ? "COALESCE(ANY_VALUE(s.progress_matched_task_name), ANY_VALUE(p.progress_matched_task_name))"
      : "ANY_VALUE(p.progress_matched_task_name)";
    const milestonesCompletedExpr = scheduleColumns.has("milestones_completed")
      ? "COALESCE(ANY_VALUE(s.milestones_completed), ANY_VALUE(p.milestones_completed), COUNTIF(t.status = 'COMPLETED'))"
      : "COALESCE(ANY_VALUE(p.milestones_completed), COUNTIF(t.status = 'COMPLETED'))";
    const milestonesTotalExpr = scheduleColumns.has("milestones_total")
      ? "COALESCE(ANY_VALUE(s.milestones_total), ANY_VALUE(p.milestones_total), COUNT(*))"
      : "COALESCE(ANY_VALUE(p.milestones_total), COUNT(*))";

    // Same guard for mart_actual_spending: erp_over_under only exists once the
    // updated sync has run, so degrade to NULL instead of erroring before then.
    let spendingColumns = new Set();
    try {
      const colRows = await queryRows(client, `
        SELECT column_name
        FROM \`${config.projectId}.${config.dataset}\`.INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = 'mart_actual_spending'
      `);
      spendingColumns = new Set(colRows.map((r) => r.column_name));
    } catch {
      spendingColumns = new Set();
    }
    const erpOverUnderExpr = spendingColumns.has("erp_over_under") ? "s.erp_over_under" : "NULL";

    // Days since the last milestone was completed = days since the completion
    // of the task that the ERP matched to the current milestone
    // (progress_matched_task_name). NULL until a job reaches its first
    // milestone. Same raw→mart fallback as the other milestone fields.
    const matchedNameForDays = scheduleColumns.has("progress_matched_task_name")
      ? "COALESCE(s.progress_matched_task_name, p.progress_matched_task_name)"
      : "p.progress_matched_task_name";
    const daysSinceMilestoneExpr = `DATE_DIFF(CURRENT_DATE(), MAX(IF(t.status = 'COMPLETED' AND LOWER(TRIM(t.activity)) = LOWER(TRIM(${matchedNameForDays})), DATE(COALESCE(t.actual_end, t.scheduled_end)), NULL)), DAY)`;

    const [
      portfolioSummary,
      constructionSummary,
      vendorSummary,
      exceptionsSummary,
      jobProgressResult,
      tasksByStageResult,
      tasksByGroupResult,
      taskRosterResult,
      vendorScorecardResult,
      vendorPoDetailResult,
      exceptionRowsResult,
      qualityChecksResult,
      actualSpendingResult,
    ] = await Promise.all([
      // Portfolio summary from schedule_tasks (richer than schedule table)
      queryFirstRow(client, `
        SELECT
          COUNT(DISTINCT job_id) AS total_jobs,
          COUNT(*) AS total_tasks,
          COUNTIF(status = 'COMPLETED') AS completed_tasks,
          SUM(COALESCE(budget_cost, 0)) AS total_budget,
          COUNT(DISTINCT plan_name) AS distinct_plans
        FROM ${tasksT}
      `),
      // Construction summary
      queryFirstRow(client, `
        SELECT
          COUNTIF(t.status = 'COMPLETED') AS completed,
          COUNTIF(t.status = 'IN_PROGRESS') AS in_progress,
          COUNTIF(t.status = 'ORDERED') AS ordered,
          COUNTIF(t.status = 'NOT_STARTED') AS not_started,
          COUNT(DISTINCT IF(t.status IN ('COMPLETED','IN_PROGRESS','ORDERED'), t.job_id, NULL)) AS jobs_with_progress,
          (
            SELECT AVG(completion_pct)
            FROM (
              SELECT SAFE_DIVIDE(COUNTIF(status = 'COMPLETED'), COUNT(*)) AS completion_pct
              FROM ${tasksT}
              GROUP BY job_id
            )
          ) AS avg_completion_pct
        FROM ${tasksT} t
      `),
      // Vendor summary
      queryFirstRow(client, `
        SELECT
          COUNT(DISTINCT vendor_name) AS total_vendors,
          SUM(COALESCE(po_amount, 0)) AS total_po_value,
          COUNT(*) AS total_pos
        FROM ${vendorsT}
      `),
      // Exception summary
      queryFirstRow(client, `
        SELECT COUNT(*) AS total_exceptions, COUNTIF(severity = 'HIGH') AS high_severity
        FROM ${exceptionT}
      `),
      // Job-level progress (prefer ERP milestone progress, fall back to task completion)
      queryRows(client, `
        SELECT
          t.job_id,
          t.lot_id,
          MAX(t.project_address) AS project_address,
          t.community,
          t.plan_name,
          COUNT(*) AS total_tasks,
          COUNTIF(t.status = 'COMPLETED') AS completed,
          COUNTIF(t.status = 'IN_PROGRESS') AS in_progress,
          COUNTIF(t.status = 'ORDERED') AS ordered,
          COUNTIF(t.status = 'NOT_STARTED') AS not_started,
          SAFE_DIVIDE(COUNTIF(t.status = 'COMPLETED'), COUNT(*)) AS task_completion_pct,
          SAFE_DIVIDE(COUNTIF(t.status = 'COMPLETED'), COUNT(*)) AS completion_pct,
          ${progressPercentExpr} AS progress_percent,
          ${progressMilestoneExpr} AS progress_milestone,
          ${matchedTaskExpr} AS progress_matched_task_name,
          ${milestonesCompletedExpr} AS milestones_completed,
          ${milestonesTotalExpr} AS milestones_total,
          ${daysSinceMilestoneExpr} AS days_since_milestone,
          SUM(COALESCE(t.budget_cost, 0)) AS total_budget,
          SUM(COALESCE(t.actual_cost, 0)) AS total_actual,
          MIN(t.scheduled_start) AS earliest_start,
          MAX(t.scheduled_end) AS latest_end,
          MIN(t.actual_start) AS actual_start,
          MAX(t.actual_end) AS actual_end,
          COALESCE(ANY_VALUE(s.current_stage), ANY_VALUE(p.current_stage)) AS current_stage,
          ANY_VALUE(p.days_in_current_stage) AS days_in_current_stage,
          ANY_VALUE(p.schedule_health_score) AS schedule_health_score
        FROM ${tasksT} t
        LEFT JOIN ${scheduleT} s ON t.job_id = s.job_id
        LEFT JOIN ${pipelineT} p ON t.job_id = p.job_id
        GROUP BY t.job_id, t.lot_id, t.community, t.plan_name
        ORDER BY progress_percent DESC, t.lot_id ASC
      `),
      // Tasks by construction stage
      queryRows(client, `
        SELECT
          stage,
          COUNT(*) AS total_tasks,
          COUNTIF(status = 'COMPLETED') AS completed,
          COUNTIF(status = 'IN_PROGRESS') AS in_progress,
          COUNTIF(status = 'ORDERED') AS ordered,
          COUNTIF(status = 'NOT_STARTED') AS not_started,
          SUM(COALESCE(budget_cost, 0)) AS stage_budget
        FROM ${tasksT}
        GROUP BY stage
        ORDER BY
          CASE stage
            WHEN 'Pre-Construction' THEN 1
            WHEN 'Foundation' THEN 2
            WHEN 'Framing' THEN 3
            WHEN 'MEP Rough' THEN 4
            WHEN 'Exterior' THEN 5
            WHEN 'Interior' THEN 6
            WHEN 'Trim' THEN 7
            WHEN 'Close-Out' THEN 8
            ELSE 9
          END
      `),
      // Tasks by trade group
      queryRows(client, `
        SELECT
          task_group,
          COUNT(*) AS total_tasks,
          COUNTIF(status = 'COMPLETED') AS completed,
          COUNTIF(status IN ('IN_PROGRESS','ORDERED')) AS active,
          SUM(COALESCE(budget_cost, 0)) AS group_budget
        FROM ${tasksT}
        GROUP BY task_group
        ORDER BY group_budget DESC
      `),
      // Task-level roster for drilldowns
      queryRows(client, `
        SELECT
          task_id, lot_id, job_id, job_name, project_address, community,
          plan_name, stage, task_group, activity, vendor_name,
          status, scheduled_start, scheduled_end, actual_start, actual_end,
          budget_cost, actual_cost
        FROM ${tasksT}
        ORDER BY
          job_id,
          CASE stage
            WHEN 'Pre-Construction' THEN 1
            WHEN 'Foundation' THEN 2
            WHEN 'Framing' THEN 3
            WHEN 'MEP Rough' THEN 4
            WHEN 'Exterior' THEN 5
            WHEN 'Interior' THEN 6
            WHEN 'Trim' THEN 7
            WHEN 'Close-Out' THEN 8
            ELSE 9
          END,
          activity ASC
      `),
      // Vendor scorecard
      queryRows(client, `
        SELECT vendor_name, total_po_value, total_invoiced, open_po_count, avg_variance_pct, overrun_flag, ranking
        FROM ${vendorScoreT}
        ORDER BY ranking ASC
      `),
      // Vendor PO detail
      queryRows(client, `
        SELECT vendor_name, po_number, job_id, po_amount, invoiced_amount, status, issue_date
        FROM ${vendorsT}
        ORDER BY po_amount DESC NULLS LAST
      `),
      // Exception rows
      queryRows(client, `
        SELECT exception_center_key, exception_type, severity, affected_entity, days_outstanding
        FROM ${exceptionT}
        ORDER BY CASE severity WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, days_outstanding DESC
      `),
      // Quality checks
      queryRows(client, `
        SELECT label, coverage, covered_rows, total_rows FROM (
          SELECT 'Tasks with budget' AS label,
            SAFE_DIVIDE(COUNTIF(budget_cost IS NOT NULL AND budget_cost > 0), COUNT(*)) AS coverage,
            COUNTIF(budget_cost IS NOT NULL AND budget_cost > 0) AS covered_rows,
            COUNT(*) AS total_rows
          FROM ${tasksT}
          UNION ALL
          SELECT 'Tasks completed',
            SAFE_DIVIDE(COUNTIF(status = 'COMPLETED'), COUNT(*)),
            COUNTIF(status = 'COMPLETED'),
            COUNT(*)
          FROM ${tasksT}
          UNION ALL
          SELECT 'Vendors with PO amount',
            SAFE_DIVIDE(COUNTIF(po_amount IS NOT NULL AND po_amount > 0), COUNT(*)),
            COUNTIF(po_amount IS NOT NULL AND po_amount > 0),
            COUNT(*)
          FROM ${vendorsT}
          UNION ALL
          SELECT 'Schedule dates populated',
            SAFE_DIVIDE(COUNTIF(scheduled_start IS NOT NULL), COUNT(*)),
            COUNTIF(scheduled_start IS NOT NULL),
            COUNT(*)
          FROM ${tasksT}
        )
      `),
      // Actual spending per job. PO variance compares sent POs only against the
      // matching task budget scope for vendors that have POs on that job.
      queryRows(client, `
        SELECT
          s.job_id, s.project_address, s.community, s.plan_name,
          s.budget_total,
          COALESCE(p.po_sent_budget_total, 0) AS po_sent_budget_total,
          COALESCE(c.completed_cost, 0) AS effective_actual_total,
          s.committed_po_total, s.paid_po_total, s.open_po_total,
          CASE
            WHEN COALESCE(s.committed_po_total, 0) > 0
              THEN COALESCE(p.po_sent_budget_total, 0) - COALESCE(s.committed_po_total, 0)
            ELSE 0
          END AS variance,
          ${erpOverUnderExpr} AS erp_over_under
        FROM ${spendingT} s
        LEFT JOIN (
          SELECT job_id, SUM(COALESCE(budget_cost, 0)) AS completed_cost
          FROM ${tasksT}
          WHERE status = 'COMPLETED'
          GROUP BY job_id
        ) c ON s.job_id = c.job_id
        LEFT JOIN (
          SELECT job_id, SUM(COALESCE(budget_cost, 0)) AS po_sent_budget_total
          FROM ${tasksT} t
          WHERE COALESCE(budget_cost, 0) > 0
            AND EXISTS (
              SELECT 1
              FROM ${vendorsT} v
              WHERE v.job_id = t.job_id
                AND COALESCE(v.po_amount, 0) != 0
                AND LOWER(TRIM(v.vendor_name)) = LOWER(TRIM(t.vendor_name))
            )
          GROUP BY job_id
        ) p ON s.job_id = p.job_id
        ORDER BY s.budget_total DESC
      `),
    ]);

    // Normalize temporal values in task roster
    const dateFields = ["scheduled_start", "scheduled_end", "actual_start", "actual_end"];
    const taskRoster = taskRosterResult.map((r) => {
      const out = { ...r };
      for (const k of dateFields) out[k] = normalizeTemporalValue(r[k]);
      return out;
    });

    const vendorPoDetail = vendorPoDetailResult.map((r) => ({
      ...r,
      issue_date: normalizeTemporalValue(r.issue_date),
    }));

    const qualityChecks = qualityChecksResult.map((r) => ({
      label: r.label,
      coverage: safeNumber(r.coverage),
      coveredRows: safeNumber(r.covered_rows),
      totalRows: safeNumber(r.total_rows),
      tone: toneFromCoverage(safeNumber(r.coverage)),
    }));

    const auditNotes = [];
    if ((qualityChecks.find((r) => r.label === "Schedule dates populated")?.coverage ?? 0) < 0.1) {
      auditNotes.push("Schedule dates are not yet populated. Job progress is derived from task completion status.");
    }
    if ((qualityChecks.find((r) => r.label === "Tasks completed")?.coverage ?? 0) < 0.05) {
      auditNotes.push("Most tasks are NOT_STARTED. The project is in early stages — expect sparse data in construction views.");
    }

    return {
      sourceMode: "live",
      errorMessage: null,
      config,
      summaries: {
        portfolio: {
          totalJobs: safeNumber(portfolioSummary.total_jobs),
          totalTasks: safeNumber(portfolioSummary.total_tasks),
          completedTasks: safeNumber(portfolioSummary.completed_tasks),
          totalBudget: safeNumber(portfolioSummary.total_budget),
          distinctPlans: safeNumber(portfolioSummary.distinct_plans),
        },
        construction: {
          completed: safeNumber(constructionSummary.completed),
          inProgress: safeNumber(constructionSummary.in_progress),
          ordered: safeNumber(constructionSummary.ordered),
          notStarted: safeNumber(constructionSummary.not_started),
          jobsWithProgress: safeNumber(constructionSummary.jobs_with_progress),
          avgCompletionPct: safeNumber(constructionSummary.avg_completion_pct),
        },
        vendors: {
          totalVendors: safeNumber(vendorSummary.total_vendors),
          totalPoValue: safeNumber(vendorSummary.total_po_value),
          totalPos: safeNumber(vendorSummary.total_pos),
        },
        exceptions: {
          totalExceptions: safeNumber(exceptionsSummary.total_exceptions),
          highSeverity: safeNumber(exceptionsSummary.high_severity),
        },
      },
      jobProgress: jobProgressResult.map((r) => ({
        ...r,
        completion_pct: safeNumber(r.completion_pct),
        task_completion_pct: safeNumber(r.task_completion_pct),
        progress_percent: safeNumber(r.progress_percent),
        progress_milestone: r.progress_milestone || null,
        progress_matched_task_name: r.progress_matched_task_name || null,
        milestones_completed: safeNumber(r.milestones_completed),
        milestones_total: safeNumber(r.milestones_total),
        total_budget: safeNumber(r.total_budget),
        completed: safeNumber(r.completed),
        in_progress: safeNumber(r.in_progress),
        ordered: safeNumber(r.ordered),
        not_started: safeNumber(r.not_started),
        total_tasks: safeNumber(r.total_tasks),
        days_in_current_stage: safeNumber(r.days_in_current_stage),
        schedule_health_score: safeNumber(r.schedule_health_score),
        earliest_start: normalizeTemporalValue(r.earliest_start),
        latest_end: normalizeTemporalValue(r.latest_end),
        actual_start: normalizeTemporalValue(r.actual_start),
        actual_end: normalizeTemporalValue(r.actual_end),
      })),
      tasksByStage: tasksByStageResult.map((r) => ({
        ...r,
        total_tasks: safeNumber(r.total_tasks),
        completed: safeNumber(r.completed),
        in_progress: safeNumber(r.in_progress),
        ordered: safeNumber(r.ordered),
        not_started: safeNumber(r.not_started),
        stage_budget: safeNumber(r.stage_budget),
      })),
      tasksByGroup: tasksByGroupResult.map((r) => ({
        ...r,
        total_tasks: safeNumber(r.total_tasks),
        completed: safeNumber(r.completed),
        active: safeNumber(r.active),
        group_budget: safeNumber(r.group_budget),
      })),
      taskRoster,
      vendorScorecard: vendorScorecardResult.map((r) => ({
        ...r,
        total_po_value: safeNumber(r.total_po_value),
        total_invoiced: safeNumber(r.total_invoiced),
        open_po_count: safeNumber(r.open_po_count),
        ranking: safeNumber(r.ranking),
      })),
      vendorPoDetail,
      exceptionRows: exceptionRowsResult,
      actualSpending: actualSpendingResult.map((r) => ({
        ...r,
        budget_total: safeNumber(r.budget_total),
        po_sent_budget_total: safeNumber(r.po_sent_budget_total),
        effective_actual_total: safeNumber(r.effective_actual_total),
        committed_po_total: safeNumber(r.committed_po_total),
        paid_po_total: safeNumber(r.paid_po_total),
        open_po_total: safeNumber(r.open_po_total),
        variance: safeNumber(r.variance),
      })),
      qualityChecks,
      auditNotes,
    };
  } catch (error) {
    console.error("[dashboard-data] BigQuery error:", error.message);
    console.error("[dashboard-data] Stack:", error.stack);
    return buildUnavailableDashboard(`Live BigQuery connection failed. ${sanitizeErrorMessage(error.message)}`);
  }
}
