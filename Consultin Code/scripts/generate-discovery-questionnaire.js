#!/usr/bin/env node
/**
 * Generate a fillable PDF "Data Infrastructure Discovery Questionnaire"
 * that prospective clients fill out before a discovery call.
 *
 * Usage:
 *   node Consultin\ Code/scripts/generate-discovery-questionnaire.js
 *   → writes Consultin Code/contracts/AD-Homes-Discovery-Questionnaire.pdf
 */

const fs = require("fs");
const path = require("path");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

// ── Questionnaire content ─────────────────────────────────────────────
const SECTIONS = [
  {
    title: "1. Company overview",
    items: [
      { type: "text", label: "Company legal name" },
      { type: "text", label: "Doing-business-as (if different)" },
      { type: "text", label: "Primary operating state(s)" },
      { type: "text", label: "Entities / LLCs in operation (one per line)", lines: 4 },
      { type: "text", label: "Homes closed last 12 months (approx.)" },
      { type: "text", label: "Target homes for next 12 months" },
      { type: "text", label: "Product mix — entry / mid / premium / build-to-rent (describe)" , lines: 3 },
    ],
  },
  {
    title: "2. Source systems (ERP + adjacent)",
    items: [
      { type: "checkbox", label: "Primary construction / job-management ERP", options: ["NewStar (Constellation)", "Hyphen HomeFront / BRIX", "BuilderMT / Mark Systems", "BuilderTrend", "CoConstruct", "Procore", "BuildPro", "Sage 300 CRE", "Viewpoint Spectrum / Vista", "CMiC", "ComputerEase", "Custom / homegrown", "Other"] },
      { type: "text", label: "If 'Other' — ERP name & version" },
      { type: "checkbox", label: "ERP hosting", options: ["Vendor-hosted SaaS", "On our server (office or colocation)", "Our cloud (Azure / AWS / GCP)", "Unsure — IT can confirm"] },
      { type: "checkbox", label: "ERP database engine (if server-hosted)", options: ["SQL Server", "Oracle", "PostgreSQL", "MySQL", "Other / N/A"] },
      { type: "checkbox", label: "ERP data access we can provide", options: ["Read-only DB user + VPN/SSH/IP allowlist", "REST API / OAuth", "Scheduled CSV export from IT", "Manual XLSX export only", "Unsure"] },
      { type: "text", label: "Who owns the ERP data and runs custom reports today?" },
      { type: "text", label: "Any ERP modules NOT currently in use (job cost, payroll, accounts payable, etc.)?", lines: 3 },
    ],
  },
  {
    title: "3. Finance & accounting",
    items: [
      { type: "text", label: "General ledger system (if different from ERP)" },
      { type: "text", label: "Accounts payable software" },
      { type: "text", label: "Accounts receivable / billing software" },
      { type: "text", label: "Construction loan / draw tracking — what tool?" },
      { type: "checkbox", label: "Are WIP and cost-to-complete reports produced today?", options: ["Yes, weekly", "Yes, monthly", "Ad hoc only", "No"] },
      { type: "text", label: "Who prepares the job-level P&L at closing?" },
      { type: "text", label: "Month-end close timeline (calendar days)" },
    ],
  },
  {
    title: "4. Sales & CRM",
    items: [
      { type: "checkbox", label: "CRM or lead tracking tool", options: ["Salesforce", "HubSpot", "Lasso CRM", "Sales Simplicity", "BuilderMT / Mark Systems", "Pipedrive", "Spreadsheet", "None", "Other"] },
      { type: "text", label: "If 'Other' — tool name" },
      { type: "text", label: "Where do contract signatures live (system + retention policy)?" },
      { type: "text", label: "How is contract-to-close progress tracked today?" },
      { type: "text", label: "Top 3 sales KPIs exec team looks at weekly", lines: 3 },
    ],
  },
  {
    title: "5. Construction operations",
    items: [
      { type: "text", label: "Schedule / milestone tracking tool (Procore, BuilderTrend, MS Project, Smartsheet, sheets…)" },
      { type: "text", label: "Field time-tracking or daily-log tool" },
      { type: "text", label: "How are superintendent workloads balanced today?" },
      { type: "text", label: "Typical construction cycle (start to CO), in days" },
      { type: "checkbox", label: "What phases/milestones are captured per job?", options: ["Permit submitted/issued", "Foundation poured", "Framing", "MEP rough-in", "Drywall", "Finishes", "Final walk", "CO", "Closing", "None of the above — informal only"] },
    ],
  },
  {
    title: "6. Land, permitting & development",
    items: [
      { type: "checkbox", label: "Land acquisition pipeline — where is it tracked?", options: ["Spreadsheet (Excel/Google Sheets)", "CRM module", "Dedicated land-acquisition tool", "Project management tool", "Not tracked systematically"] },
      { type: "text", label: "Typical # of land deals in pipeline at any time" },
      { type: "text", label: "Permit tracking — in ERP, separate tool, or sheets?" },
      { type: "text", label: "Primary permitting jurisdictions (top 5 cities/counties)", lines: 3 },
    ],
  },
  {
    title: "7. Property management (if applicable)",
    items: [
      { type: "checkbox", label: "Do you hold rental inventory?", options: ["Yes — build-to-rent is a strategy", "Yes — hold-for-rent some unsold", "No"] },
      { type: "text", label: "PM software (Yardi, AppFolio, RentManager, Buildium, other)" },
      { type: "text", label: "Number of units currently under management" },
    ],
  },
  {
    title: "8. Reporting & spreadsheets today",
    items: [
      { type: "text", label: "What are your most important weekly reports? (list title + audience)", lines: 4 },
      { type: "text", label: "What are your most important monthly reports?", lines: 4 },
      { type: "text", label: "How many hours/week are spent manually assembling reports? (estimate)" },
      { type: "text", label: "Who owns this work today?" },
      { type: "text", label: "Which spreadsheets are mission-critical right now? List file names + which department owns each (5–15 typical)", lines: 6 },
      { type: "checkbox", label: "Where do those spreadsheets live?", options: ["Google Drive / Sheets", "Microsoft OneDrive (M365)", "SharePoint document library", "Dropbox / Box", "Local drives / email attachments"] },
      { type: "checkbox", label: "If on Microsoft 365 — can your IT register an Azure AD app with Files.Read.All for our ingestion?", options: ["Yes — IT confirmed", "Yes — needs to be requested", "No / unsure", "N/A — not on Microsoft 365"] },
      { type: "checkbox", label: "Schema-stability of these spreadsheets", options: ["Stable — same columns every week", "Mostly stable — occasional new columns", "Volatile — columns rename / move regularly"] },
    ],
  },
  {
    title: "9. Current BI / dashboarding",
    items: [
      { type: "checkbox", label: "Do you have any BI tool in place?", options: ["Power BI", "Tableau", "Looker", "Metabase", "Domo", "Sisense", "Retool / custom", "None"] },
      { type: "text", label: "What has worked and what hasn't with current BI? (honest answer helps)", lines: 4 },
      { type: "text", label: "Who administers BI access and permissions today?" },
    ],
  },
  {
    title: "10. Cloud & warehouse posture",
    items: [
      { type: "checkbox", label: "Existing cloud accounts", options: ["Google Cloud (GCP)", "Amazon Web Services (AWS)", "Microsoft Azure", "None yet"] },
      { type: "checkbox", label: "Existing data warehouse", options: ["BigQuery", "Snowflake", "Redshift", "Databricks", "Postgres / SQL Server", "None"] },
      { type: "text", label: "Who administers cloud billing and IAM?" },
      { type: "text", label: "Any data residency / compliance requirements (HIPAA, SOC 2, specific state rules)?", lines: 3 },
    ],
  },
  {
    title: "11. Integrations & data flow",
    items: [
      { type: "checkbox", label: "Any existing data pipelines in place?", options: ["Fivetran", "Stitch", "Airbyte", "n8n / Zapier / Make", "Custom scripts", "None"] },
      { type: "text", label: "If yes, who maintains them and what do they sync?", lines: 3 },
      { type: "text", label: "Systems that already integrate with each other today — describe briefly", lines: 4 },
      { type: "text", label: "Integrations you wish existed but don't", lines: 4 },
    ],
  },
  {
    title: "12. Pain points & goals",
    items: [
      { type: "text", label: "What number do you not trust today? (cost, margin, cycle time, sales velocity, etc.)", lines: 4 },
      { type: "text", label: "Where in the lifecycle does visibility break down first?", lines: 3 },
      { type: "text", label: "If we could deliver one dashboard in 30 days, what would it show?", lines: 3 },
      { type: "text", label: "What must be true for this engagement to be a win 6 months from now?", lines: 4 },
    ],
  },
  {
    title: "13. Stakeholders & access",
    items: [
      { type: "text", label: "Primary point of contact — name, role, email, phone" },
      { type: "text", label: "Exec sponsor — name, role" },
      { type: "text", label: "IT / data lead — name, role" },
      { type: "text", label: "Who needs dashboard access day-one? (roles or names)", lines: 4 },
    ],
  },
  {
    title: "14. Constraints, timeline, & engagement preference",
    items: [
      { type: "text", label: "Target go-live date" },
      { type: "text", label: "Hard deadline (if any) — and reason" },
      { type: "checkbox", label: "Engagement tier preference", options: ["Minimal — Construction + Sales + Audits, 4 weeks, $25K–$45K", "Typical — 8–9 tabs across 5 sections, 6 weeks, $50K–$85K", "Full — All 12 tabs incl. Land + Property Mgmt, 8 weeks, $90K–$140K", "Custom — discuss in kickoff call"] },
      { type: "checkbox", label: "Ongoing monthly retainer interest ($3K–$6K/mo for KPI tuning, schema-drift fixes, alerts)", options: ["Yes — quote me", "Maybe — revisit at delivery", "No — we'll handle ongoing maintenance ourselves"] },
      { type: "text", label: "Anything else we should know — prior failed attempts, internal politics, competing tools under evaluation", lines: 5 },
    ],
  },
];

// ── Layout constants ──────────────────────────────────────────────────
const PAGE_W = 612;      // US Letter
const PAGE_H = 792;
const MARGIN_X = 48;
const MARGIN_TOP = 60;
const MARGIN_BOTTOM = 60;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

const ACCENT = rgb(16 / 255, 185 / 255, 129 / 255);
const TEXT_DARK = rgb(0.12, 0.15, 0.19);
const TEXT_MUTED = rgb(0.36, 0.4, 0.46);
const LINE_SOFT = rgb(0.82, 0.86, 0.90);
const BG_SOFT = rgb(0.97, 0.98, 0.99);

// ── Builder ───────────────────────────────────────────────────────────
(async function main() {
  const doc = await PDFDocument.create();
  doc.setTitle("A.D. Homes & Consulting — Data Infrastructure Discovery Questionnaire");
  doc.setAuthor("A.D. Homes & Consulting");
  doc.setSubject("Pre-engagement discovery questionnaire");
  doc.setProducer("A.D. Homes & Consulting");
  doc.setCreator("A.D. Homes & Consulting");

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const form = doc.getForm();

  // State
  let page = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN_TOP;
  let fieldCounter = 0;
  let isCoverPage = true;

  // ── Cover page ──
  drawCover(page, helv, helvBold);
  page = doc.addPage([PAGE_W, PAGE_H]);
  y = PAGE_H - MARGIN_TOP;
  isCoverPage = false;

  // ── Sections ──
  for (const section of SECTIONS) {
    // Section header — new page if not enough room
    if (y < 220) {
      page = doc.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN_TOP;
    }
    y = drawSectionHeader(page, section.title, y, helv, helvBold);

    for (const item of section.items) {
      // Determine height needed
      const neededHeight = measureItem(item, helv);
      if (y - neededHeight < MARGIN_BOTTOM) {
        page = doc.addPage([PAGE_W, PAGE_H]);
        y = PAGE_H - MARGIN_TOP;
      }

      if (item.type === "text") {
        y = drawTextField(page, form, item, y, helv, `f_${++fieldCounter}`);
      } else if (item.type === "checkbox") {
        y = drawCheckboxGroup(page, form, item, y, helv, () => `f_${++fieldCounter}`);
      }
    }
  }

  // ── Final signature block ──
  if (y < 160) {
    page = doc.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN_TOP;
  }
  y = drawSignatureBlock(page, form, y, helv, helvBold, () => `f_${++fieldCounter}`);

  // Footer on every page
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`A.D. Homes & Consulting  ·  consulting.aderpsystems.com  ·  (407) 840-1368`, {
      x: MARGIN_X,
      y: 30,
      size: 8,
      font: helv,
      color: TEXT_MUTED,
    });
    p.drawText(`${i + 1} / ${pages.length}`, {
      x: PAGE_W - MARGIN_X - 30,
      y: 30,
      size: 8,
      font: helv,
      color: TEXT_MUTED,
    });
  });

  const bytes = await doc.save();
  const outPath = path.resolve(__dirname, "..", "contracts", "AD-Homes-Discovery-Questionnaire.pdf");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, bytes);
  console.log(`✓ Wrote fillable PDF: ${outPath}`);
  console.log(`  ${pages.length} pages · ${fieldCounter} fillable fields`);
})();

// ── Drawing helpers ───────────────────────────────────────────────────

function drawCover(page, helv, helvBold) {
  // Soft header band
  page.drawRectangle({ x: 0, y: PAGE_H - 8, width: PAGE_W, height: 8, color: ACCENT });

  page.drawText("A.D. HOMES & CONSULTING", {
    x: MARGIN_X, y: PAGE_H - 70, size: 10, font: helvBold, color: ACCENT,
  });
  page.drawText("Custom data platforms for residential homebuilders", {
    x: MARGIN_X, y: PAGE_H - 86, size: 9, font: helv, color: TEXT_MUTED,
  });

  // Title
  wrapText(page, "Data Infrastructure", MARGIN_X, PAGE_H - 150, 42, helvBold, TEXT_DARK, CONTENT_W);
  wrapText(page, "Discovery Questionnaire", MARGIN_X, PAGE_H - 200, 42, helvBold, TEXT_DARK, CONTENT_W);

  page.drawText("Pre-engagement worksheet", {
    x: MARGIN_X, y: PAGE_H - 240, size: 13, font: helv, color: ACCENT,
  });

  // Intro copy
  const intro = [
    "This questionnaire helps us understand your source systems, reporting",
    "landscape, and operational pain before the discovery call. Fill out what",
    "you know — skip what you don't. We'll fill in the rest together.",
    "",
    "Return completed PDF to adurand@aderpsystems.com or bring it to the call.",
    "Estimated time: 25–40 minutes. Not every question applies to every builder.",
  ];
  let yy = PAGE_H - 290;
  for (const line of intro) {
    page.drawText(line, { x: MARGIN_X, y: yy, size: 11, font: helv, color: TEXT_DARK });
    yy -= 16;
  }

  // What we'll do with the answers
  page.drawLine({ start: { x: MARGIN_X, y: yy - 20 }, end: { x: PAGE_W - MARGIN_X, y: yy - 20 }, color: LINE_SOFT, thickness: 0.6 });
  page.drawText("What we'll do with your answers", {
    x: MARGIN_X, y: yy - 44, size: 11, font: helvBold, color: TEXT_DARK,
  });
  const bullets = [
    "• Score each KPI as ready / partial / blocked based on available data",
    "• Produce a written warehouse audit within 5 business days",
    "• Return a fixed-price engagement proposal matched to your scope",
    "• Flag any source-system constraints that would change the timeline",
  ];
  let by = yy - 62;
  for (const b of bullets) {
    page.drawText(b, { x: MARGIN_X, y: by, size: 10, font: helv, color: TEXT_DARK });
    by -= 15;
  }

  // Meta fields (respondent)
  page.drawLine({ start: { x: MARGIN_X, y: by - 20 }, end: { x: PAGE_W - MARGIN_X, y: by - 20 }, color: LINE_SOFT, thickness: 0.6 });
  page.drawText("Respondent", { x: MARGIN_X, y: by - 44, size: 11, font: helvBold, color: TEXT_DARK });

  let metaY = by - 70;
  const metaFields = [
    "Your name",
    "Title / role",
    "Email",
    "Phone",
    "Date completed (YYYY-MM-DD)",
  ];
  for (const label of metaFields) {
    page.drawText(label, { x: MARGIN_X, y: metaY, size: 9, font: helv, color: TEXT_MUTED });
    // Draw line
    page.drawLine({
      start: { x: MARGIN_X, y: metaY - 6 },
      end: { x: PAGE_W - MARGIN_X, y: metaY - 6 },
      color: LINE_SOFT,
      thickness: 0.5,
    });
    metaY -= 26;
  }

  // We don't put form fields on cover — keep it clean. Users can print+sign or
  // type into section 13 (Stakeholders).
}

function drawSectionHeader(page, title, y, helv, helvBold) {
  // Accent bar
  page.drawRectangle({
    x: MARGIN_X, y: y - 4, width: 4, height: 20, color: ACCENT,
  });
  page.drawText(title, {
    x: MARGIN_X + 14, y: y, size: 15, font: helvBold, color: TEXT_DARK,
  });
  return y - 34;
}

function drawTextField(page, form, item, y, helv, name) {
  const lines = item.lines ?? 1;
  const fieldH = lines === 1 ? 22 : 18 * lines;

  page.drawText(item.label, {
    x: MARGIN_X, y, size: 9.5, font: helv, color: TEXT_DARK,
  });

  const fieldY = y - fieldH - 4;
  const tf = form.createTextField(name);
  tf.enableMultiline(lines > 1);
  tf.addToPage(page, {
    x: MARGIN_X,
    y: fieldY,
    width: CONTENT_W,
    height: fieldH,
    borderColor: LINE_SOFT,
    backgroundColor: BG_SOFT,
    borderWidth: 0.6,
    font: helv,
  });
  tf.setFontSize(10);

  return fieldY - 14;
}

function drawCheckboxGroup(page, form, item, y, helv, nextName) {
  page.drawText(item.label, {
    x: MARGIN_X, y, size: 9.5, font: helv, color: TEXT_DARK,
  });
  y -= 18;

  const colWidth = CONTENT_W / 2;
  const rowH = 18;
  let colIdx = 0;
  let rowStartY = y;

  for (const opt of item.options) {
    const xCol = MARGIN_X + (colIdx % 2) * colWidth;
    const yCol = rowStartY - Math.floor(colIdx / 2) * rowH;

    const cb = form.createCheckBox(nextName());
    cb.addToPage(page, {
      x: xCol, y: yCol - 10, width: 10, height: 10,
      borderColor: TEXT_DARK, borderWidth: 0.7,
    });
    page.drawText(opt, {
      x: xCol + 16, y: yCol - 8, size: 9, font: helv, color: TEXT_DARK,
    });
    colIdx++;
  }
  const rows = Math.ceil(item.options.length / 2);
  return rowStartY - rows * rowH - 8;
}

function drawSignatureBlock(page, form, y, helv, helvBold, nextName) {
  y -= 10;
  page.drawLine({
    start: { x: MARGIN_X, y },
    end: { x: PAGE_W - MARGIN_X, y },
    color: LINE_SOFT, thickness: 0.6,
  });
  y -= 24;
  page.drawText("Confirmation", {
    x: MARGIN_X, y, size: 13, font: helvBold, color: TEXT_DARK,
  });
  y -= 22;
  page.drawText(
    "By completing this questionnaire I confirm the information is accurate to the best",
    { x: MARGIN_X, y, size: 9.5, font: helv, color: TEXT_DARK }
  );
  y -= 13;
  page.drawText(
    "of my knowledge and may be used to prepare a warehouse audit and engagement proposal.",
    { x: MARGIN_X, y, size: 9.5, font: helv, color: TEXT_DARK }
  );
  y -= 30;

  // Signature (text field)
  page.drawText("Signature / typed name", { x: MARGIN_X, y, size: 9, font: helv, color: TEXT_MUTED });
  const sig = form.createTextField(nextName());
  sig.addToPage(page, {
    x: MARGIN_X, y: y - 28, width: CONTENT_W * 0.6, height: 22,
    borderColor: LINE_SOFT, backgroundColor: BG_SOFT, borderWidth: 0.6,
    font: helv,
  });
  sig.setFontSize(11);

  page.drawText("Date", { x: MARGIN_X + CONTENT_W * 0.65, y, size: 9, font: helv, color: TEXT_MUTED });
  const dateF = form.createTextField(nextName());
  dateF.addToPage(page, {
    x: MARGIN_X + CONTENT_W * 0.65, y: y - 28, width: CONTENT_W * 0.35, height: 22,
    borderColor: LINE_SOFT, backgroundColor: BG_SOFT, borderWidth: 0.6,
    font: helv,
  });
  dateF.setFontSize(11);

  return y - 50;
}

function measureItem(item, helv) {
  if (item.type === "text") {
    const fieldH = (item.lines ?? 1) === 1 ? 22 : 18 * (item.lines ?? 1);
    return 14 /*label*/ + 4 + fieldH + 14 /*gap*/;
  }
  if (item.type === "checkbox") {
    const rows = Math.ceil(item.options.length / 2);
    return 18 /*label*/ + rows * 18 + 8;
  }
  return 40;
}

function wrapText(page, text, x, y, size, font, color, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    const tryLine = current ? `${current} ${w}` : w;
    if (font.widthOfTextAtSize(tryLine, size) > maxWidth) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = tryLine;
    }
  }
  if (current) lines.push(current);
  let yy = y;
  for (const line of lines) {
    page.drawText(line, { x, y: yy, size, font, color });
    yy -= size * 1.1;
  }
}
