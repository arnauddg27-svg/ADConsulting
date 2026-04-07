/* ── Sunshine Homes Demo Data ──
   Static mock data for the marketing-site dashboard demo.
   All numbers are realistic for a mid-size Florida production builder.
   Uses seeded pseudo-random for deterministic output across renders. */

import type {
  SHJob, SHSale, SHLoan, SHLandDeal, SHPermit, SHPropertyUnit, SHSubdivision, SHAuditJob,
  SHDashboardFilters, SHSectionDef, SHCycleTimeByCity, SHCycleTimeTrendPoint, SHMilestoneSparkline,
} from "@/types/sunshine-homes";

/* ═══════════════════════════════════════════════════════════
   SEEDED PSEUDO-RANDOM
   ═══════════════════════════════════════════════════════════ */
function createRng(initial: number) {
  let seed = initial;
  const rand = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
  const between = (a: number, b: number) => Math.round(a + rand() * (b - a));
  const shuffle = <T,>(arr: T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return { rand, pick, between, shuffle };
}

/* ═══════════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════════ */
export const SECTIONS: SHSectionDef[] = [
  { id: "land", label: "LAND", tabs: [
    { id: "land-dashboard",    label: "Dashboard" },
    { id: "land-pipeline",     label: "Pipeline" },
  ]},
  { id: "permitting", label: "PERMITTING", tabs: [
    { id: "permitting-dashboard", label: "Dashboard" },
    { id: "permitting-pipeline",  label: "Pipeline" },
  ]},
  { id: "loans", label: "LOANS", tabs: [
    { id: "loans-dashboard", label: "Dashboard" },
    { id: "loans-pipeline",  label: "Pipeline" },
  ]},
  { id: "construction", label: "CONSTRUCTION", tabs: [
    { id: "construction-dashboard",    label: "Dashboard" },
    { id: "construction-pipeline",     label: "Pipeline" },
    { id: "construction-cycle",        label: "Cycle Time" },
    { id: "construction-cost",         label: "Cost Metrics" },
    { id: "construction-subdivisions", label: "Subdivisions" },
  ]},
  { id: "sales", label: "SALES", tabs: [
    { id: "sales-dashboard", label: "Dashboard" },
    { id: "sales-pipeline",  label: "Pipeline" },
  ]},
  { id: "property-mgmt", label: "PROPERTY MGMT", tabs: [
    { id: "pm-dashboard", label: "Dashboard" },
    { id: "pm-pipeline",  label: "Pipeline" },
  ]},
  { id: "audits", label: "AUDITS", tabs: [
    { id: "audits-dashboard", label: "P&L Dashboard" },
    { id: "audits-pipeline",  label: "Job Audits" },
  ]},
];

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const COMMUNITIES = ["Sunshine Ridge", "Palm Coast Estates", "Emerald Bay", "Coral Springs Village", "Magnolia Park", "Cypress Landing", "Lake Nona Shores", "Riverview Heights"] as const;
const CITIES = ["Orlando", "Tampa", "Jacksonville", "Lakeland"] as const;
const COUNTIES = ["Orange", "Hillsborough", "Duval", "Polk"] as const;
const ENTITIES = ["Sunshine Homes LLC", "Sunshine Homes East LLC"] as const;
const PLANS = ["Avalon 1983", "Harmon 2100", "Seville 2306", "Meridian 2450", "Catalina 1750"] as const;
const SUPERS = ["Mike Torres", "Sarah Chen", "David Brooks", "Lisa Nguyen", "James Wilson", "Maria Santos"] as const;
const STAGES = ["Permit", "Foundation", "Framing", "MEP / Drywall", "Finishes", "Closing"] as const;
const LENDERS = ["First National Bank", "SunTrust Builders", "Capital One CRE", "Regions Construction", "TD Bank"] as const;
const AGENTS = ["Alex Rivera", "Jessica Chen", "Mark Thompson", "Sarah Patel", "David Kim"] as const;

/* City → county mapping */
const CITY_COUNTY: Record<string, string> = {
  Orlando: "Orange",
  Tampa: "Hillsborough",
  Jacksonville: "Duval",
  Lakeland: "Polk",
};

/* Community → city / county / entity mapping */
const COMM_META: Record<string, { city: string; county: string; entity: string }> = {
  "Sunshine Ridge":        { city: "Orlando",      county: "Orange",        entity: "Sunshine Homes LLC" },
  "Palm Coast Estates":    { city: "Jacksonville", county: "Duval",         entity: "Sunshine Homes East LLC" },
  "Emerald Bay":           { city: "Tampa",        county: "Hillsborough",  entity: "Sunshine Homes LLC" },
  "Coral Springs Village": { city: "Orlando",      county: "Orange",        entity: "Sunshine Homes LLC" },
  "Magnolia Park":         { city: "Tampa",        county: "Hillsborough",  entity: "Sunshine Homes East LLC" },
  "Cypress Landing":       { city: "Jacksonville", county: "Duval",         entity: "Sunshine Homes East LLC" },
  "Lake Nona Shores":      { city: "Orlando",      county: "Orange",        entity: "Sunshine Homes LLC" },
  "Riverview Heights":     { city: "Lakeland",     county: "Polk",          entity: "Sunshine Homes East LLC" },
};

/* Lot costs per community */
const LOT_COSTS: Record<string, number> = {
  "Sunshine Ridge": 52000, "Palm Coast Estates": 38000, "Emerald Bay": 48000,
  "Coral Springs Village": 45000, "Magnolia Park": 42000, "Cypress Landing": 40000,
  "Lake Nona Shores": 55000, "Riverview Heights": 35000,
};

/* ═══════════════════════════════════════════════════════════
   DATE HELPERS
   ═══════════════════════════════════════════════════════════ */
function addDays(base: string, d: number): string {
  const dt = new Date(base);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

function dateToStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* ═══════════════════════════════════════════════════════════
   JOB TYPE DERIVATION
   ═══════════════════════════════════════════════════════════ */
function deriveJobType(stage: string, coDate: string | null): import("@/types/sunshine-homes").SHJobType {
  if (stage === "Permit") return "Permitting";
  if (stage === "Closing" && coDate) return "Completed";
  if (stage === "Foundation" || stage === "Framing" || stage === "MEP / Drywall" || stage === "Finishes") return "Construction";
  if (stage === "Closing") return "Construction";
  return "Construction";
}

/* ═══════════════════════════════════════════════════════════
   JOBS (160 total) — fully generated
   ═══════════════════════════════════════════════════════════ */
function generateJobs(): SHJob[] {
  const rng = createRng(42);
  const { rand, pick, between } = rng;

  /* Target ~20 per community, weighted by stage */
  const stageWeights = [8, 12, 22, 25, 20, 13]; // Permit, Foundation, Framing, MEP, Finishes, Closing
  const totalWeight = stageWeights.reduce((a, b) => a + b, 0);

  function pickWeightedStageIdx(): number {
    let r = rand() * totalWeight;
    for (let i = 0; i < stageWeights.length; i++) {
      r -= stageWeights[i];
      if (r <= 0) return i;
    }
    return 5;
  }

  const result: SHJob[] = [];
  let id = 1;

  // Uneven community volume distribution (total = 160) to avoid flat, identical bars.
  const communityJobCounts = [24, 18, 22, 19, 17, 21, 23, 16];

  for (let ci = 0; ci < COMMUNITIES.length; ci++) {
    const comm = COMMUNITIES[ci];
    const meta = COMM_META[comm];
    const lot = LOT_COSTS[comm] ?? 42000;
    const commCode = (COMMUNITIES.indexOf(comm) + 1) * 1000;
    const jobCount = communityJobCounts[ci] ?? 20;

    for (let j = 0; j < jobCount; j++) {
      const jobNum = commCode + j + 1;
      const plan = pick(PLANS);
      const sup = pick(SUPERS);
      const stageIdx = pickWeightedStageIdx();
      const stage = STAGES[stageIdx];

      const completionRanges: [number, number][] = [
        [2, 9], [10, 22], [25, 48], [50, 74], [75, 93], [94, 99],
      ];
      const completionPct = between(completionRanges[stageIdx][0], completionRanges[stageIdx][1]);

      const contractValue = between(380000, 620000);
      // Gross margin band tuned to stay realistic for production builders (~10-18%).
      const costRatio = 0.82 + rand() * 0.08;
      const estimatedCost = Math.round(contractValue * costRatio);
      const spentRatio = completionPct / 100;
      const actualCost = Math.round(estimatedCost * spentRatio * (0.95 + rand() * 0.1));
      const budget = Math.round(estimatedCost * (1.01 + rand() * 0.03));
      const projectedFinalCost = Math.round(budget * (0.97 + rand() * 0.05));

      /* Cost category breakdowns — realistic splits of total budget/actual */
      const permittingBudget = Math.round(budget * (0.03 + rand() * 0.02));  // 3-5% of budget
      const permittingActual = Math.round(permittingBudget * (0.90 + rand() * 0.20)); // -10% to +10%
      const sidewalkBudget = Math.round(budget * (0.06 + rand() * 0.03));   // 6-9% of budget
      const sidewalkActual = Math.round(sidewalkBudget * (0.92 + rand() * 0.18));
      const verticalBudget = Math.round(budget * (0.45 + rand() * 0.10));   // 45-55% of budget
      const verticalActual = Math.round(verticalBudget * (0.94 + rand() * 0.12));
      const margin = contractValue - estimatedCost;
      const marginPct = Math.round((margin / contractValue) * 1000) / 10;

      /* Start dates spread 2024-01-01 to 2026-03-01 */
      const totalMonths = 26; // Jan 2024 through Mar 2026
      const monthOffset = between(0, totalMonths - 1);
      const startYear = 2024 + Math.floor(monthOffset / 12);
      const startMonth = (monthOffset % 12) + 1;
      const startDay = between(1, 28);
      const startDate = dateToStr(startYear, startMonth, startDay);

      const estMonths = between(8, 14);
      const estDate = new Date(startDate);
      estDate.setMonth(estDate.getMonth() + estMonths);
      const estCompletion = estDate.toISOString().slice(0, 10);

      /* Compute total cycle days from start to now (or completion) */
      const refDate = "2026-03-25";
      const totalCycleDays = Math.max(1, daysBetween(startDate, refDate));
      const daysInPhase = between(3, 38);

      /* Milestone dates based on stage progress */
      const permitDate = stageIdx >= 0 ? addDays(startDate, between(10, 20)) : null;
      const foundationDate = stageIdx >= 1 ? addDays(startDate, between(35, 60)) : null;
      const framingDate = stageIdx >= 2 ? addDays(startDate, between(70, 110)) : null;
      const mepDate = stageIdx >= 3 ? addDays(startDate, between(120, 170)) : null;
      const drywallDate = stageIdx >= 3 && rand() > 0.25 ? addDays(startDate, between(150, 200)) : null;
      const finishesDate = stageIdx >= 4 ? addDays(startDate, between(210, 280)) : null;
      const coDate = stageIdx >= 5 ? addDays(startDate, between(290, 360)) : null;
      const closingDate = stageIdx >= 5 && rand() > 0.6 ? addDays(startDate, between(340, 390)) : null;

      const jobType = deriveJobType(stage, coDate);

      result.push({
        id,
        jobCode: `SH-${jobNum}`,
        lot: `Lot ${between(1, 80)}`,
        community: comm,
        city: meta.city,
        county: meta.county,
        entity: meta.entity,
        plan,
        superintendent: sup,
        jobType,
        stage,
        completionPct,
        startDate,
        estCompletion,
        contractValue,
        estimatedCost,
        actualCostToDate: actualCost,
        wipBalance: actualCost,
        lotCost: lot,
        originalBudget: budget,
        projectedFinalCost,
        margin,
        marginPct,
        daysInCurrentPhase: daysInPhase,
        totalCycleDays,
        year: startYear,
        permittingBudget,
        permittingActual,
        sidewalkBudget,
        sidewalkActual,
        verticalBudget,
        verticalActual,
        permitDate,
        foundationDate,
        framingDate,
        mepDate,
        drywallDate,
        finishesDate,
        coDate,
        closingDate,
      });
      id++;
    }
  }
  return result;
}

export const jobs: SHJob[] = generateJobs();

/* ═══════════════════════════════════════════════════════════
   SALES (80 total) — generated
   ═══════════════════════════════════════════════════════════ */
const BUYER_FAMILIES = [
  "Johnson", "Martinez", "Williams", "Davis", "Brown", "Taylor", "Anderson",
  "Thomas", "Jackson", "White", "Harris", "Clark", "Lewis", "Robinson",
  "Walker", "Young", "King", "Wright", "Scott", "Green", "Adams",
  "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips",
  "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Murphy",
  "Rivera", "Cook", "Rogers", "Morgan", "Peterson", "Cooper", "Reed",
  "Bailey", "Bell", "Gomez", "Kelly", "Howard", "Ward", "Cox", "Diaz",
  "Richardson", "Wood", "Watson", "Brooks", "Bennett", "Gray", "James",
  "Reyes", "Cruz", "Hughes", "Price", "Myers", "Long", "Foster",
  "Sanders", "Ross", "Morales", "Powell", "Sullivan", "Russell", "Ortiz",
  "Jenkins", "Gutierrez", "Perry", "Butler", "Barnes", "Fisher", "Henderson",
  "Coleman", "Simmons", "Patterson",
] as const;

function generateSales(): SHSale[] {
  const rng = createRng(137);
  const { rand, pick, between, shuffle } = rng;

  const result: SHSale[] = [];
  /* Build sales from real jobs so cross-table joins stay complete and logical. */
  const selectedJobs = shuffle([...jobs]).slice(0, Math.min(80, jobs.length));

  for (let i = 0; i < selectedJobs.length; i++) {
    const job = selectedJobs[i];
    const comm = job.community;
    const meta = COMM_META[comm];
    const plan = job.plan;
    const buyer = `${pick(BUYER_FAMILIES)} Family`;
    const agent = pick(AGENTS);
    const salePrice = Math.round(job.contractValue * (0.97 + rand() * 0.08));
    const contractDate = addDays(job.startDate, between(20, 150));
    let status: SHSale["status"];
    if (job.stage === "Closing" || job.completionPct >= 94) {
      status = rand() > 0.12 ? "closed" : "pending";
    } else if (job.completionPct >= 75 || job.stage === "Finishes") {
      status = rand() > 0.2 ? "pending" : "active";
    } else {
      status = rand() > 0.92 ? "cancelled" : "active";
    }
    const closingDate = status === "closed"
      ? (job.closingDate ?? job.coDate ?? addDays(contractDate, between(170, 320)))
      : status === "pending"
        ? addDays(contractDate, between(60, 220))
        : null;
    const cy = new Date(contractDate).getFullYear();

    result.push({
      id: i + 1,
      jobCode: job.jobCode,
      community: comm,
      city: meta.city,
      entity: job.entity,
      plan,
      buyer,
      agent,
      salePrice,
      contractDate,
      closingDate,
      status,
      year: cy,
    });
  }
  return result;
}

export const sales: SHSale[] = generateSales();

/* ═══════════════════════════════════════════════════════════
   LOANS (~80 total) — generated from actual jobs array
   ═══════════════════════════════════════════════════════════ */
const EXTRA_LENDERS = [
  "First National Bank", "SunTrust Builders", "Capital One CRE", "Regions Construction", "TD Bank",
  "Wells Fargo CRE", "JPMorgan Builder Finance", "Centennial Bank", "Seacoast Bank", "Valley National",
] as const;

function generateLoans(): SHLoan[] {
  const rng = createRng(271);
  const { rand, pick, between, shuffle } = rng;
  const result: SHLoan[] = [];

  /* Pick ~80 jobs from the actual jobs array to create loans for */
  const shuffledJobs = shuffle([...jobs]);
  const loanJobs = shuffledJobs.slice(0, Math.min(80, shuffledJobs.length));

  for (let i = 0; i < loanJobs.length; i++) {
    const job = loanJobs[i];
    const lender = pick(EXTRA_LENDERS);
    // Loan principal tracks home value and stage profile rather than random flat bands.
    const loanAmount = Math.round(job.contractValue * (0.52 + rand() * 0.24)); // 52-76% LTC/LTV band
    // Draw progression follows construction completion with modest variance.
    const drawTarget = job.completionPct * (0.88 + rand() * 0.16) + (job.stage === "Permit" ? -8 : 0);
    const drawPct = Math.max(5, Math.min(97, Math.round(drawTarget * 10) / 10));
    const totalDrawn = Math.round(loanAmount * drawPct / 100);
    const interestRate = Math.round((5.50 + rand() * 2.5) * 100) / 100; // 5.50% to 8.00%

    // Expiration runway compresses as jobs move toward close.
    let daysUntilExpiration: number;
    if (job.stage === "Permit" || job.stage === "Foundation") daysUntilExpiration = between(220, 420);
    else if (job.stage === "Framing" || job.stage === "MEP / Drywall") daysUntilExpiration = between(120, 300);
    else if (job.stage === "Finishes") daysUntilExpiration = between(45, 180);
    else daysUntilExpiration = between(15, 120); // Closing

    if (job.completionPct >= 95) daysUntilExpiration = between(5, 75);

    const expDate = addDays("2026-03-25", daysUntilExpiration);

    result.push({
      id: i + 1,
      jobCode: job.jobCode,
      community: job.community,
      city: job.city,
      lender,
      loanAmount,
      totalDrawn,
      drawPct,
      interestRate,
      startDate: job.startDate,
      expirationDate: expDate,
      daysUntilExpiration,
      year: new Date(job.startDate).getFullYear(),
    });
  }
  return result;
}

export const loans: SHLoan[] = generateLoans();

/* ═══════════════════════════════════════════════════════════
   LAND DEALS (15 total) — realistic for a mid-size builder (~600 total lots)
   ═══════════════════════════════════════════════════════════ */
function generateLandDeals(): SHLandDeal[] {
  const rng = createRng(311);
  const { rand, pick, between } = rng;
  const result: SHLandDeal[] = [];

  const TOTAL = 15;

  for (let i = 0; i < TOTAL; i++) {
    const comm = pick(COMMUNITIES);
    const meta = COMM_META[comm];
    const acres = between(10, 45);
    const lots = between(25, 55);
    const costPerLot = LOT_COSTS[comm] ?? 42000;
    const acquisitionCost = lots * costPerLot;
    // Spread across 2021-2026
    const year = 2021 + (i % 6);
    const contractMonth = between(1, 12);
    const contractDay = between(1, 28);
    const contractDate = dateToStr(year, contractMonth, contractDay);
    // 60% closed, 30% under-contract, 10% cancelled
    const roll = rand();
    const status: SHLandDeal["status"] = roll < 0.60 ? "closed" : roll < 0.90 ? "under-contract" : "cancelled";
    // For closed deals, close in the SAME month (small offset) so drill-down date matches
    const closeDate = status === "closed"
      ? dateToStr(year, contractMonth, Math.min(contractDay + between(1, 10), 28))
      : null;

    result.push({
      id: i + 1,
      name: `${comm} Parcel ${String.fromCharCode(65 + (i % 15))}-${i + 1}`,
      city: meta.city,
      county: meta.county,
      community: comm,
      acres,
      lots,
      acquisitionCost,
      costPerLot,
      status,
      closeDate,
      contractDate,
      year,
    });
  }
  return result;
}

export const landDeals: SHLandDeal[] = generateLandDeals();

/* ═══════════════════════════════════════════════════════════
   PERMITS (120 total) — generated, multi-year 2021-2026
   ═══════════════════════════════════════════════════════════ */
function generatePermits(): SHPermit[] {
  const rng = createRng(401);
  const { rand, pick, between, shuffle } = rng;
  const result: SHPermit[] = [];

  const permitTypes = ["Building", "Electrical", "Plumbing", "Mechanical"] as const;
  const permitSubTypes = [
    "Site Plans", "House Plans", "Septic",
    "Building Permit Submitted", "Permit Approved", "Permit Issued",
  ] as const;

  const TOTAL = 120;
  const selectedJobs = shuffle([...jobs]).slice(0, Math.min(TOTAL, jobs.length));

  for (let i = 0; i < selectedJobs.length; i++) {
    const job = selectedJobs[i];
    const comm = job.community;
    const meta = COMM_META[comm];
    const permitType = pick(permitTypes);
    const permitSubType = pick(permitSubTypes);
    const submittedDate = job.permitDate
      ? addDays(job.permitDate, between(-45, -5))
      : addDays(job.startDate, between(5, 35));

    let status: SHPermit["status"];
    if (job.stage === "Permit") {
      status = rand() > 0.45 ? "in-review" : "pending";
    } else if (job.stage === "Foundation" || job.stage === "Framing") {
      status = rand() > 0.22 ? "approved" : "in-review";
    } else {
      status = rand() > 0.18 ? "issued" : "approved";
    }
    if (rand() > 0.975) status = "rejected";

    let daysInReview = status === "approved" || status === "issued"
      ? between(7, 24)
      : status === "rejected"
        ? between(25, 60)
        : between(14, 45);

    // Stage-aware tuning so permit aging aligns with job lifecycle narratives.
    if (job.stage === "Permit") {
      if (status === "pending" || status === "in-review") daysInReview = between(20, 52);
      if (status === "approved" || status === "issued") daysInReview = between(12, 30);
    } else if (job.stage === "Foundation" || job.stage === "Framing") {
      if (status === "approved" || status === "issued") daysInReview = between(8, 22);
    } else {
      if (status === "issued") daysInReview = between(6, 18);
    }
    const approvedDate = (status === "approved" || status === "issued") ? addDays(submittedDate, daysInReview) : null;
    const issuedDate = status === "issued" ? addDays(approvedDate!, between(3, 10)) : null;
    const year = new Date(submittedDate).getFullYear();

    result.push({
      id: i + 1,
      jobCode: job.jobCode,
      community: comm,
      city: meta.city,
      permitType,
      permitSubType,
      submittedDate,
      approvedDate,
      issuedDate,
      daysInReview,
      status,
      year,
    });
  }
  return result;
}

export const permits: SHPermit[] = generatePermits();

/* ═══════════════════════════════════════════════════════════
   PROPERTY MANAGEMENT (~60 units) — generated
   ═══════════════════════════════════════════════════════════ */
function generatePMUnits(): SHPropertyUnit[] {
  const rng = createRng(503);
  const { rand, pick, between } = rng;
  const result: SHPropertyUnit[] = [];

  const streetNames: Record<string, string[]> = {
    "Sunshine Ridge": ["Sunshine Blvd", "Sun Valley Dr"],
    "Palm Coast Estates": ["Palm Coast Dr", "Coastal Way"],
    "Emerald Bay": ["Emerald Bay Ln", "Bay View Ct"],
    "Coral Springs Village": ["Coral Springs Ct", "Village Green Dr"],
    "Magnolia Park": ["Magnolia Way", "Park Meadow Ln"],
    "Cypress Landing": ["Cypress Ct", "Landing Cir"],
    "Lake Nona Shores": ["Nona Shore Dr", "Lakeview Ter"],
    "Riverview Heights": ["Riverview Blvd", "Heights Way"],
  };

  const tenantFamilies = [
    "Rivera", "Chen", "Diaz", "Nguyen", "Patel", "Sanders", "Brooks", "Kim",
    "Garcia", "Owens", "Thompson", "Morgan", "Wilson", "Chang", "Reeves", "Fox",
    "Hayes", "Cooper", "Barnes", "Grant", "Webb", "Cruz", "Lopez", "Turner",
    "Bennett", "Howard", "Reed", "Fisher", "Arnold", "Stone", "Dunn", "Gibson",
    "Graham", "Price", "Butler", "Hart", "Marshall", "Watson", "Murray", "Wells",
    "Jordan", "Flores", "Hunt", "Simmons", "Cole", "Ortega", "Silva", "Shaw",
    "Tucker", "Powers", "Blake", "Hoffman", "Holland", "Dean", "Kelley", "Page",
    "Schwartz", "Barker", "Valdez", "Medina", "Hicks", "Chambers",
  ] as const;

  const planBedsBaths: Record<string, { beds: string; sqft: number }> = {
    "Avalon 1983":   { beds: "3/2", sqft: 1983 },
    "Harmon 2100":   { beds: "4/2", sqft: 2100 },
    "Seville 2306":  { beds: "4/3", sqft: 2306 },
    "Meridian 2450": { beds: "4/3", sqft: 2450 },
    "Catalina 1750": { beds: "3/2", sqft: 1750 },
  };

  /* Occupancy pool for ~60 units: ~44 leased, ~6 vacant, ~4 make-ready, ~3 eviction, ~3 notice-to-vacate */
  const occupancyPool: SHPropertyUnit["occupancy"][] = [
    ...Array(44).fill("leased" as const),
    ...Array(6).fill("vacant" as const),
    ...Array(4).fill("make-ready" as const),
    ...Array(3).fill("eviction" as const),
    ...Array(3).fill("notice-to-vacate" as const),
  ];

  let id = 1;
  // Distribute across communities: 7-8 per community, total = 60
  const commCounts = [8, 8, 7, 8, 7, 7, 8, 7]; // total = 60

  for (let ci = 0; ci < COMMUNITIES.length; ci++) {
    const comm = COMMUNITIES[ci];
    const meta = COMM_META[comm];
    const streets = streetNames[comm] ?? ["Main St"];
    const count = commCounts[ci];

    for (let j = 0; j < count; j++) {
      const street = streets[j % streets.length];
      const plan = pick(PLANS);
      const info = planBedsBaths[plan];
      const occupancy = occupancyPool[id - 1] ?? "leased";
      const isOccupied = occupancy === "leased" || occupancy === "eviction" || occupancy === "notice-to-vacate";
      const marketRent = between(1800, 3600);
      const monthlyRent = isOccupied ? marketRent - between(0, 150) : 0;
      const tenant = isOccupied ? `${pick(tenantFamilies)} Family` : null;
      const leaseStartYear = 2022 + (id % 5); // spread across 2022-2026
      const leaseStartMonth = between(1, 12);
      const leaseStart = dateToStr(leaseStartYear, leaseStartMonth, between(1, 28));
      const leaseEnd = isOccupied ? dateToStr(2026 + (rand() > 0.5 ? 1 : 0), between(1, 12), between(1, 28)) : null;
      const isDelinquent = isOccupied && rand() > 0.80;
      const delinquentAmount = isDelinquent ? monthlyRent : 0;
      const daysPastDue = isDelinquent ? between(3, 27) : 0; // stay under 28
      const managementPct = Math.round((8 + rand() * 2) * 10) / 10;
      const deposit = monthlyRent > 0 ? monthlyRent : marketRent;

      result.push({
        id,
        address: `${100 + j * 14} ${street}`,
        community: comm,
        city: meta.city,
        entity: meta.entity,
        bedsBaths: info.beds,
        sqft: info.sqft,
        monthlyRent,
        marketRent,
        deposit,
        managementPct,
        occupancy,
        tenant,
        leaseStart,
        leaseEnd,
        delinquentAmount,
        daysPastDue,
        year: leaseStartYear,
      });
      id++;
    }
  }
  return result;
}

export const propertyUnits: SHPropertyUnit[] = generatePMUnits();

/* ═══════════════════════════════════════════════════════════
   SUBDIVISIONS (10 total) — hand-crafted
   ═══════════════════════════════════════════════════════════ */
export const subdivisions: SHSubdivision[] = [
  { id: 1, projectName: "Sunshine Ridge Phase 3", community: "Sunshine Ridge", city: "Orlando", entity: "Sunshine Homes LLC", totalLots: 45, lotsSold: 32, lotsUnderConstruction: 8, lotsCompleted: 22, lotsRemaining: 13, totalAcres: 28, landCost: 2250000, developmentCost: 1800000, totalInvestment: 4050000, projectedRevenue: 22500000, projectedProfit: 5625000, profitMarginPct: 25.0, status: "active", startDate: "2024-08-15", estCompletionDate: "2027-06-30", infraComplete: true, zoningApproved: true, platRecorded: true, utilityStubs: true, roadsComplete: true, retentionPonds: true, avgLotPrice: 50000, avgHomePrice: 515000, absorptionRate: 2.8, monthsOfInventory: 4.6 },
  { id: 2, projectName: "Palm Coast Estates Phase 2", community: "Palm Coast Estates", city: "Jacksonville", entity: "Sunshine Homes East LLC", totalLots: 38, lotsSold: 22, lotsUnderConstruction: 8, lotsCompleted: 12, lotsRemaining: 16, totalAcres: 22, landCost: 1520000, developmentCost: 1140000, totalInvestment: 2660000, projectedRevenue: 17100000, projectedProfit: 3990000, profitMarginPct: 23.3, status: "active", startDate: "2024-10-01", estCompletionDate: "2027-09-30", infraComplete: true, zoningApproved: true, platRecorded: true, utilityStubs: true, roadsComplete: true, retentionPonds: true, avgLotPrice: 40000, avgHomePrice: 450000, absorptionRate: 2.2, monthsOfInventory: 7.3 },
  { id: 3, projectName: "Emerald Bay Phase 2", community: "Emerald Bay", city: "Tampa", entity: "Sunshine Homes LLC", totalLots: 52, lotsSold: 38, lotsUnderConstruction: 8, lotsCompleted: 28, lotsRemaining: 14, totalAcres: 35, landCost: 2600000, developmentCost: 2080000, totalInvestment: 4680000, projectedRevenue: 27040000, projectedProfit: 7020000, profitMarginPct: 26.0, status: "active", startDate: "2024-06-10", estCompletionDate: "2027-03-31", infraComplete: true, zoningApproved: true, platRecorded: true, utilityStubs: true, roadsComplete: true, retentionPonds: true, avgLotPrice: 50000, avgHomePrice: 520000, absorptionRate: 3.2, monthsOfInventory: 4.4 },
  { id: 4, projectName: "Coral Springs Village Ph 1", community: "Coral Springs Village", city: "Orlando", entity: "Sunshine Homes LLC", totalLots: 30, lotsSold: 28, lotsUnderConstruction: 8, lotsCompleted: 18, lotsRemaining: 2, totalAcres: 18, landCost: 1350000, developmentCost: 1080000, totalInvestment: 2430000, projectedRevenue: 15600000, projectedProfit: 3900000, profitMarginPct: 25.0, status: "active", startDate: "2024-04-20", estCompletionDate: "2026-12-31", infraComplete: true, zoningApproved: true, platRecorded: true, utilityStubs: true, roadsComplete: true, retentionPonds: true, avgLotPrice: 45000, avgHomePrice: 520000, absorptionRate: 2.5, monthsOfInventory: 0.8 },
  { id: 5, projectName: "Lake Nona Shores Parcel A", community: "Lake Nona Shores", city: "Orlando", entity: "Sunshine Homes LLC", totalLots: 65, lotsSold: 28, lotsUnderConstruction: 10, lotsCompleted: 8, lotsRemaining: 37, totalAcres: 40, landCost: 3900000, developmentCost: 3250000, totalInvestment: 7150000, projectedRevenue: 36400000, projectedProfit: 9100000, profitMarginPct: 25.0, status: "pre-development", startDate: "2025-03-01", estCompletionDate: "2028-09-30", infraComplete: false, zoningApproved: true, platRecorded: true, utilityStubs: false, roadsComplete: false, retentionPonds: false, avgLotPrice: 60000, avgHomePrice: 560000, absorptionRate: 2.0, monthsOfInventory: 18.5 },
  { id: 6, projectName: "Riverview Heights Phase 1", community: "Riverview Heights", city: "Lakeland", entity: "Sunshine Homes East LLC", totalLots: 32, lotsSold: 14, lotsUnderConstruction: 6, lotsCompleted: 5, lotsRemaining: 18, totalAcres: 18, landCost: 1120000, developmentCost: 896000, totalInvestment: 2016000, projectedRevenue: 14720000, projectedProfit: 3312000, profitMarginPct: 22.5, status: "pre-development", startDate: "2025-01-15", estCompletionDate: "2028-03-31", infraComplete: false, zoningApproved: true, platRecorded: false, utilityStubs: false, roadsComplete: false, retentionPonds: false, avgLotPrice: 35000, avgHomePrice: 460000, absorptionRate: 1.8, monthsOfInventory: 10.0 },
  { id: 7, projectName: "Magnolia Park Phase 1", community: "Magnolia Park", city: "Tampa", entity: "Sunshine Homes East LLC", totalLots: 40, lotsSold: 40, lotsUnderConstruction: 0, lotsCompleted: 40, lotsRemaining: 0, totalAcres: 24, landCost: 1680000, developmentCost: 1344000, totalInvestment: 3024000, projectedRevenue: 19600000, projectedProfit: 4900000, profitMarginPct: 25.0, status: "sold-out", startDate: "2023-06-01", estCompletionDate: "2026-06-30", infraComplete: true, zoningApproved: true, platRecorded: true, utilityStubs: true, roadsComplete: true, retentionPonds: true, avgLotPrice: 42000, avgHomePrice: 490000, absorptionRate: 4.0, monthsOfInventory: 0.0 },
  { id: 8, projectName: "Cypress Landing Phase 2", community: "Cypress Landing", city: "Jacksonville", entity: "Sunshine Homes East LLC", totalLots: 35, lotsSold: 5, lotsUnderConstruction: 0, lotsCompleted: 0, lotsRemaining: 30, totalAcres: 20, landCost: 1400000, developmentCost: 1050000, totalInvestment: 2450000, projectedRevenue: 16800000, projectedProfit: 3780000, profitMarginPct: 22.5, status: "planning", startDate: "2026-01-01", estCompletionDate: "2029-01-31", infraComplete: false, zoningApproved: false, platRecorded: false, utilityStubs: false, roadsComplete: false, retentionPonds: false, avgLotPrice: 40000, avgHomePrice: 480000, absorptionRate: 1.5, monthsOfInventory: 20.0 },
  { id: 9, projectName: "Magnolia Park Phase 2", community: "Magnolia Park", city: "Tampa", entity: "Sunshine Homes East LLC", totalLots: 40, lotsSold: 12, lotsUnderConstruction: 5, lotsCompleted: 4, lotsRemaining: 28, totalAcres: 24, landCost: 1680000, developmentCost: 1400000, totalInvestment: 3080000, projectedRevenue: 20000000, projectedProfit: 5200000, profitMarginPct: 26.0, status: "active", startDate: "2025-06-01", estCompletionDate: "2028-06-30", infraComplete: true, zoningApproved: true, platRecorded: true, utilityStubs: true, roadsComplete: false, retentionPonds: true, avgLotPrice: 42000, avgHomePrice: 500000, absorptionRate: 2.0, monthsOfInventory: 14.0 },
  { id: 10, projectName: "Lake Nona Shores Parcel B", community: "Lake Nona Shores", city: "Orlando", entity: "Sunshine Homes LLC", totalLots: 42, lotsSold: 8, lotsUnderConstruction: 3, lotsCompleted: 2, lotsRemaining: 34, totalAcres: 25, landCost: 2520000, developmentCost: 2100000, totalInvestment: 4620000, projectedRevenue: 23940000, projectedProfit: 5880000, profitMarginPct: 24.6, status: "pre-development", startDate: "2025-09-01", estCompletionDate: "2029-03-31", infraComplete: false, zoningApproved: true, platRecorded: true, utilityStubs: false, roadsComplete: false, retentionPonds: false, avgLotPrice: 60000, avgHomePrice: 570000, absorptionRate: 1.6, monthsOfInventory: 21.3 },
];

/* ═══════════════════════════════════════════════════════════
   FORMATTING HELPERS
   ═══════════════════════════════════════════════════════════ */
export function fmt$(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}

export function fmtN(v: number): string {
  return v.toLocaleString();
}

export function fmtPct(v: number): string {
  if (!isFinite(v)) return "N/A";
  return `${v.toFixed(1)}%`;
}

/* ═══════════════════════════════════════════════════════════
   FILTER HELPER
   ═══════════════════════════════════════════════════════════ */
function isInTimePeriod(dateStr: string | null | undefined, period: import("@/types/sunshine-homes").SHTimePeriod): boolean {
  if (period === "all" || !dateStr) return true;
  const d = new Date(dateStr);
  const now = new Date("2026-03-25"); // demo reference date
  if (period === "month") {
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }
  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    const dq = Math.floor(d.getMonth() / 3);
    return d.getFullYear() === now.getFullYear() && dq === q;
  }
  if (period === "year") {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

export function matchFilters<T extends { community?: string; city?: string; entity?: string; stage?: string; startDate?: string; contractDate?: string; submittedDate?: string; closeDate?: string | null; expirationDate?: string; leaseStart?: string; leaseEnd?: string | null }>(
  item: T,
  filters: SHDashboardFilters,
): boolean {
  if (filters.city && item.city !== filters.city) return false;
  if (filters.entity && item.entity !== filters.entity) return false;
  if (filters.community && item.community !== filters.community) return false;
  if (filters.stage && item.stage && item.stage !== filters.stage) return false;
  if (filters.status) {
    // Check 'status' property (most types) or 'occupancy' (PropertyUnit)
    const itemStatus = (item as any).status ?? (item as any).occupancy ?? null;
    if (itemStatus && String(itemStatus).toLowerCase() !== filters.status.toLowerCase()) return false;
  }
  if (filters.drillYear || filters.drillQuarter || filters.drillMonth) {
    // Find the primary date field
    const dateStr: string | null = (item as any).startDate ?? (item as any).contractDate ?? (item as any).submittedDate ?? (item as any).closeDate ?? (item as any).expirationDate ?? (item as any).leaseStart ?? (item as any).leaseEnd ?? null;
    if (dateStr) {
      const d = new Date(dateStr);
      if (filters.drillYear && d.getFullYear() !== filters.drillYear) return false;
      if (filters.drillQuarter) {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        if (q !== filters.drillQuarter) return false;
      }
      if (filters.drillMonth && d.getMonth() + 1 !== filters.drillMonth) return false;
    }
  }
  if (filters.timePeriod && filters.timePeriod !== "all") {
    const dateField = item.startDate || item.contractDate || item.submittedDate || item.closeDate || item.expirationDate || item.leaseStart || item.leaseEnd;
    if (!isInTimePeriod(dateField, filters.timePeriod)) return false;
  }
  return true;
}

/** Extract quarter (1-4) from a date string */
export function getQuarter(dateStr: string): number {
  if (!dateStr) return 1;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 1;
  return Math.ceil((d.getMonth() + 1) / 3);
}

/** Extract month name from a date string */
export function getMonthLabel(dateStr: string): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleString("en-US", { month: "short" });
}

/** Extract day number from a date string */
export function getDayLabel(dateStr: string): string {
  if (!dateStr) return "Day ?";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Day ?";
  return `Day ${d.getDate()}`;
}

/* ═══════════════════════════════════════════════════════════
   DERIVED KPI FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

export function getConstructionKPIs(filteredJobs: SHJob[]) {
  const active = filteredJobs.filter(j => j.stage !== "Closing" && j.completionPct < 95);
  const totalWip = filteredJobs.reduce((s, j) => s + j.wipBalance, 0);
  const avgCompletion = filteredJobs.length
    ? filteredJobs.reduce((s, j) => s + j.completionPct, 0) / filteredJobs.length
    : 0;
  return { totalJobs: filteredJobs.length, activeJobs: active.length, avgCompletion, totalWip };
}

export function getJobsByStage(filteredJobs: SHJob[]) {
  const counts: Record<string, number> = {};
  for (const s of STAGES) counts[s] = 0;
  for (const j of filteredJobs) counts[j.stage] = (counts[j.stage] || 0) + 1;
  return STAGES.map(s => ({ label: s, value: counts[s] }));
}

export function getCommunityBreakdown(filteredJobs: SHJob[]) {
  const map = new Map<string, { count: number; wip: number; avgCompletion: number }>();
  for (const j of filteredJobs) {
    const e = map.get(j.community) || { count: 0, wip: 0, avgCompletion: 0 };
    e.count++;
    e.wip += j.wipBalance;
    e.avgCompletion += j.completionPct;
    map.set(j.community, e);
  }
  return Array.from(map.entries())
    .map(([name, d]) => ({ label: name, value: d.count, wip: d.wip, avgCompletion: d.count ? d.avgCompletion / d.count : 0 }))
    .sort((a, b) => b.value - a.value);
}

export function getSalesKPIs(filteredSales: SHSale[]) {
  // Pipeline KPIs should track open contracts, not already-closed sales.
  const openSales = filteredSales.filter(s => s.status === "active" || s.status === "pending");
  const totalValue = openSales.reduce((s, r) => s + r.salePrice, 0);
  const avgPrice = openSales.length ? totalValue / openSales.length : 0;
  const pending = filteredSales.filter(s => s.status === "pending").length;
  return { totalSales: openSales.length, totalValue, avgPrice, pendingClosings: pending };
}

export function getSalesByCommunity(filteredSales: SHSale[]) {
  const map = new Map<string, { count: number; value: number }>();
  for (const s of filteredSales.filter(s => s.status !== "cancelled")) {
    const e = map.get(s.community) || { count: 0, value: 0 };
    e.count++;
    e.value += s.salePrice;
    map.set(s.community, e);
  }
  return Array.from(map.entries())
    .map(([label, d]) => ({ label, value: d.count, totalValue: d.value }))
    .sort((a, b) => b.value - a.value);
}

export function getSalesByPlan(filteredSales: SHSale[]) {
  const map = new Map<string, { count: number; avgPrice: number; totalPrice: number }>();
  for (const s of filteredSales.filter(s => s.status !== "cancelled")) {
    const e = map.get(s.plan) || { count: 0, avgPrice: 0, totalPrice: 0 };
    e.count++;
    e.totalPrice += s.salePrice;
    map.set(s.plan, e);
  }
  return Array.from(map.entries())
    .map(([label, d]) => ({ label, value: d.count, avgPrice: d.count ? d.totalPrice / d.count : 0 }))
    .sort((a, b) => b.value - a.value);
}

export function getLoanKPIs(filteredLoans: SHLoan[]) {
  const totalBalance = filteredLoans.reduce((s, l) => s + l.loanAmount, 0);
  const totalDrawn = filteredLoans.reduce((s, l) => s + l.totalDrawn, 0);
  const avgDraw = (filteredLoans.length && totalBalance > 0) ? (totalDrawn / totalBalance) * 100 : 0;
  const expiringSoon = filteredLoans.filter(l => l.daysUntilExpiration <= 60).length;
  const lenders = new Set(filteredLoans.map(l => l.lender)).size;
  return { totalBalance, totalDrawn, avgDrawPct: avgDraw, expiringSoon, lenderCount: lenders };
}

export function getLenderDistribution(filteredLoans: SHLoan[]) {
  const map = new Map<string, { count: number; totalAmount: number }>();
  for (const l of filteredLoans) {
    const e = map.get(l.lender) || { count: 0, totalAmount: 0 };
    e.count++;
    e.totalAmount += l.loanAmount;
    map.set(l.lender, e);
  }
  return Array.from(map.entries())
    .map(([label, d]) => ({ label, value: d.count, totalAmount: d.totalAmount }))
    .sort((a, b) => b.totalAmount - a.totalAmount);
}

export function getLandKPIs(filteredDeals: SHLandDeal[]) {
  const active = filteredDeals.filter(d => d.status === "under-contract");
  const closed = filteredDeals.filter(d => d.status === "closed");
  const totalLotsInPipeline = active.reduce((s, d) => s + d.lots, 0);
  const avgCostPerLot = active.length
    ? active.reduce((s, d) => s + d.costPerLot, 0) / active.length
    : 0;
  return { activeDeals: active.length, closedDeals: closed.length, totalLotsInPipeline, avgCostPerLot };
}

export function getPermitKPIs(filteredPermits: SHPermit[]) {
  const approved = filteredPermits.filter(p => p.status === "approved").length;
  const inReview = filteredPermits.filter(p => p.status === "in-review").length;
  const pending = filteredPermits.filter(p => p.status === "pending").length;
  const rejected = filteredPermits.filter(p => p.status === "rejected").length;
  const issued = filteredPermits.filter(p => p.status === "issued").length;
  const avgDays = filteredPermits.length
    ? filteredPermits.reduce((s, p) => s + p.daysInReview, 0) / filteredPermits.length
    : 0;
  return { total: filteredPermits.length, approved, inReview, pending, rejected, issued, avgDaysToApproval: avgDays };
}

export function getPMKPIs(filteredUnits: SHPropertyUnit[]) {
  const occupied = filteredUnits.filter(u =>
    u.occupancy === "leased" || u.occupancy === "eviction" || u.occupancy === "notice-to-vacate",
  ).length;
  const total = filteredUnits.length;
  const occupancyRate = total ? (occupied / total) * 100 : 0;
  const totalRent = filteredUnits.reduce((s, u) => s + u.monthlyRent, 0);
  const delinquent = filteredUnits.filter(u => u.delinquentAmount > 0).length;
  return { totalUnits: total, occupancyRate, monthlyRent: totalRent, delinquentUnits: delinquent };
}

export function getSubdivisionKPIs(filteredSubs: SHSubdivision[]) {
  const totalLots = filteredSubs.reduce((s, d) => s + d.totalLots, 0);
  const totalSold = filteredSubs.reduce((s, d) => s + d.lotsSold, 0);
  const totalRemaining = filteredSubs.reduce((s, d) => s + d.lotsRemaining, 0);
  const totalInvestment = filteredSubs.reduce((s, d) => s + d.totalInvestment, 0);
  const totalProjectedRevenue = filteredSubs.reduce((s, d) => s + d.projectedRevenue, 0);
  const totalProjectedProfit = filteredSubs.reduce((s, d) => s + d.projectedProfit, 0);
  const avgAbsorption = filteredSubs.length
    ? filteredSubs.reduce((s, d) => s + d.absorptionRate, 0) / filteredSubs.length
    : 0;
  const avgMargin = filteredSubs.length
    ? filteredSubs.reduce((s, d) => s + d.profitMarginPct, 0) / filteredSubs.length
    : 0;
  const activeSubs = filteredSubs.filter(d => d.status === "active").length;
  const preDev = filteredSubs.filter(d => d.status === "pre-development").length;
  const soldOut = filteredSubs.filter(d => d.status === "sold-out").length;
  const planning = filteredSubs.filter(d => d.status === "planning").length;
  return {
    totalSubdivisions: filteredSubs.length,
    totalLots, totalSold, totalRemaining,
    soldPct: totalLots ? (totalSold / totalLots) * 100 : 0,
    totalInvestment, totalProjectedRevenue, totalProjectedProfit,
    avgAbsorption, avgMargin, activeSubs, preDev, soldOut, planning,
  };
}

/* ═══════════════════════════════════════════════════════════
   COST DATA
   ═══════════════════════════════════════════════════════════ */
export function getCostKPIs(filteredJobs: SHJob[]) {
  const totalBudget = filteredJobs.reduce((s, j) => s + j.originalBudget, 0);
  const totalActual = filteredJobs.reduce((s, j) => s + j.actualCostToDate, 0);
  // Apples-to-apples checkpoints:
  // 1) To-date variance compares actual spend to earned budget by completion.
  // 2) Forecast variance compares projected final to total original budget.
  const budgetToDate = filteredJobs.reduce((s, j) => s + (j.originalBudget * (j.completionPct / 100)), 0);
  const varianceToDate = totalActual - budgetToDate;
  const forecastFinal = filteredJobs.reduce((s, j) => s + j.projectedFinalCost, 0);
  const variance = forecastFinal - totalBudget;
  const avgMargin = filteredJobs.length
    ? filteredJobs.reduce((s, j) => s + j.marginPct, 0) / filteredJobs.length
    : 0;
  return { totalBudget, totalActual, budgetToDate, varianceToDate, forecastFinal, variance, avgMargin };
}

export function getCostBreakdown() {
  return [
    { label: "Labor",          value: 8400000, color: "#14b8a6" },
    { label: "Materials",      value: 6200000, color: "#0d9488" },
    { label: "Subcontractors", value: 4800000, color: "#22d3ee" },
    { label: "Land & Permits", value: 3600000, color: "#3b82f6" },
    { label: "Overhead",       value: 1800000, color: "#1e40af" },
  ];
}

/** Community-level cost category variance: Permitting Δ, Sidewalk Δ, Vertical Δ, Total Δ */
export function getCostCategoryVariance(filteredJobs: SHJob[]) {
  const commMap = new Map<string, {
    permBudget: number; permActual: number;
    sideBudget: number; sideActual: number;
    vertBudget: number; vertActual: number;
    jobCount: number;
  }>();

  for (const j of filteredJobs) {
    const e = commMap.get(j.community) || {
      permBudget: 0, permActual: 0,
      sideBudget: 0, sideActual: 0,
      vertBudget: 0, vertActual: 0,
      jobCount: 0,
    };
    e.permBudget += j.permittingBudget;
    e.permActual += j.permittingActual;
    e.sideBudget += j.sidewalkBudget;
    e.sideActual += j.sidewalkActual;
    e.vertBudget += j.verticalBudget;
    e.vertActual += j.verticalActual;
    e.jobCount++;
    commMap.set(j.community, e);
  }

  return Array.from(commMap.entries()).map(([community, d]) => ({
    community,
    jobCount: d.jobCount,
    permittingDelta: d.permActual - d.permBudget,
    sidewalkDelta: d.sideActual - d.sideBudget,
    verticalDelta: d.vertActual - d.vertBudget,
    totalDelta: (d.permActual - d.permBudget) + (d.sideActual - d.sideBudget) + (d.vertActual - d.vertBudget),
  })).sort((a, b) => a.totalDelta - b.totalDelta);
}

/* ═══════════════════════════════════════════════════════════
   CYCLE TIME STATIC DATA
   ═══════════════════════════════════════════════════════════ */
export const avgPhaseDays = [
  { phase: "Permit",        days: 12, color: "#0f766e" },
  { phase: "Foundation",    days: 38, color: "#0d9488" },
  { phase: "Framing",       days: 52, color: "#14b8a6" },
  { phase: "MEP / Drywall", days: 65, color: "#22d3ee" },
  { phase: "Finishes",      days: 58, color: "#3b82f6" },
  { phase: "Closing",       days: 15, color: "#1e40af" },
];

export const cycleTimeDistribution = [
  { bucket: "< 200d",   count: 8,  color: "#0f766e" },
  { bucket: "200–250d", count: 18, color: "#14b8a6" },
  { bucket: "250–300d", count: 20, color: "#22d3ee" },
  { bucket: "300–350d", count: 10, color: "#3b82f6" },
  { bucket: "> 350d",   count: 4,  color: "#1e40af" },
];

/* ═══════════════════════════════════════════════════════════
   CYCLE TIME DERIVED FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

const PHASE_COLORS: Record<string, string> = {
  "Permit": "#0f766e",
  "Foundation": "#0d9488",
  "Framing": "#14b8a6",
  "MEP / Drywall": "#22d3ee",
  "Finishes": "#3b82f6",
  "Closing": "#1e40af",
};

/** CP-11: Stacked cycle time by city — per-city phase durations from milestone dates */
export function getCycleTimeByCity(allJobs: SHJob[]): SHCycleTimeByCity[] {
  const cityMap = new Map<string, { phaseTotals: Record<string, number>; phaseCounts: Record<string, number>; jobCount: number }>();

  for (const j of allJobs) {
    if (!j.permitDate || !j.foundationDate) continue; // need at least 2 milestones
    const entry = cityMap.get(j.city) || {
      phaseTotals: {} as Record<string, number>,
      phaseCounts: {} as Record<string, number>,
      jobCount: 0,
    };
    entry.jobCount++;

    const milestones: [string, string | null][] = [
      ["Permit", j.permitDate],
      ["Foundation", j.foundationDate],
      ["Framing", j.framingDate],
      ["MEP / Drywall", j.mepDate],
      ["Finishes", j.finishesDate],
      ["Closing", j.coDate],
    ];

    let prevDate = j.startDate;
    for (const [phase, date] of milestones) {
      if (date) {
        const days = daysBetween(prevDate, date);
        if (days > 0) {
          entry.phaseTotals[phase] = (entry.phaseTotals[phase] || 0) + days;
          entry.phaseCounts[phase] = (entry.phaseCounts[phase] || 0) + 1;
        }
        prevDate = date;
      }
    }

    cityMap.set(j.city, entry);
  }

  return Array.from(cityMap.entries()).map(([city, data]) => {
    const phases = STAGES.map(phase => ({
      phase,
      days: data.phaseCounts[phase] ? Math.round(data.phaseTotals[phase] / data.phaseCounts[phase]) : 0,
      color: PHASE_COLORS[phase] || "#64748b",
    }));
    const total = phases.reduce((s, p) => s + p.days, 0);
    return { city, phases, total, jobCount: data.jobCount };
  }).sort((a, b) => a.total - b.total);
}

/** CP-12: Cycle time trendline — group completed jobs by start-date quarter, avg cycle time per quarter */
export function getCycleTimeTrend(allJobs: SHJob[]): SHCycleTimeTrendPoint[] {
  const completed = allJobs.filter(j => j.coDate);
  const qMap = new Map<string, { total: number; count: number; jobs: SHJob[] }>();

  for (const j of completed) {
    const d = new Date(j.startDate);
    const q = Math.floor(d.getMonth() / 3) + 1;
    const key = `${d.getFullYear()} Q${q}`;
    const entry = qMap.get(key) || { total: 0, count: 0, jobs: [] };
    entry.total += j.totalCycleDays;
    entry.count++;
    entry.jobs.push(j);
    qMap.set(key, entry);
  }

  return Array.from(qMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      avgDays: Math.round(data.total / data.count),
      jobCount: data.count,
      jobs: data.jobs,
    }));
}

/** CP-18: Completion trendlines — 3 lines: foundation-to-completion, framing-to-completion, finishes-to-completion */
export function getCompletionTrendlines(allJobs: SHJob[]): { period: string; foundationToCompletion: number; framingToCompletion: number; finishesToCompletion: number }[] {
  const completed = allJobs.filter(j => j.coDate && j.foundationDate && j.framingDate && j.finishesDate);
  const qMap = new Map<string, { f2c: number[]; fr2c: number[]; fin2c: number[] }>();

  for (const j of completed) {
    const d = new Date(j.startDate);
    const q = Math.floor(d.getMonth() / 3) + 1;
    const key = `${d.getFullYear()} Q${q}`;
    const entry = qMap.get(key) || { f2c: [], fr2c: [], fin2c: [] };
    entry.f2c.push(daysBetween(j.foundationDate!, j.coDate!));
    entry.fr2c.push(daysBetween(j.framingDate!, j.coDate!));
    entry.fin2c.push(daysBetween(j.finishesDate!, j.coDate!));
    qMap.set(key, entry);
  }

  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  return Array.from(qMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period,
      foundationToCompletion: avg(data.f2c),
      framingToCompletion: avg(data.fr2c),
      finishesToCompletion: avg(data.fin2c),
    }));
}

/** CP-16: Milestone sparkline cards — per-city avg days between milestones with monthly data points */
export function getMilestoneSparklines(allJobs: SHJob[]): SHMilestoneSparkline[] {
  const goals: Record<string, number> = {
    Orlando: 300,
    Tampa: 305,
    Jacksonville: 310,
    Lakeland: 315,
  };

  const cityMonthly = new Map<string, Map<string, number[]>>();

  for (const j of allJobs) {
    if (!j.coDate || !j.startDate) continue;
    const totalDays = daysBetween(j.startDate, j.coDate);
    if (totalDays <= 0) continue;

    const d = new Date(j.startDate);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    if (!cityMonthly.has(j.city)) cityMonthly.set(j.city, new Map());
    const monthMap = cityMonthly.get(j.city)!;
    if (!monthMap.has(monthKey)) monthMap.set(monthKey, []);
    monthMap.get(monthKey)!.push(totalDays);
  }

  return [...CITIES].map(city => {
    const monthMap = cityMonthly.get(city) || new Map();
    const sortedKeys = Array.from(monthMap.keys()).sort();
    const data = sortedKeys.map(k => {
      const vals = monthMap.get(k)!;
      return Math.round(vals.reduce((a: number, b: number) => a + b, 0) / vals.length);
    });

    const current = data.length ? data[data.length - 1] : 0;
    // Keep milestone cards in positive-performance framing for demo storytelling.
    const baselineGoal = goals[city] || 300;
    const goal = Math.max(baselineGoal, Math.round(current * 1.08));
    const status: SHMilestoneSparkline["status"] = current <= goal * 0.95 ? "on-track" : "at-risk";

    return { city, current, goal, data, status };
  });
}

/** CP-10: Stage duration outliers — jobs exceeding 1.5x the average stage duration for their community */
export function getStageOutliers(allJobs: SHJob[]): SHJob[] {
  // Compute avg daysInCurrentPhase per community+stage
  const avgMap = new Map<string, { total: number; count: number }>();
  for (const j of allJobs) {
    const key = `${j.community}||${j.stage}`;
    const e = avgMap.get(key) || { total: 0, count: 0 };
    e.total += j.daysInCurrentPhase;
    e.count++;
    avgMap.set(key, e);
  }

  return allJobs.filter(j => {
    const key = `${j.community}||${j.stage}`;
    const e = avgMap.get(key);
    if (!e || e.count < 2) return false;
    const avg = e.total / e.count;
    return j.daysInCurrentPhase > avg * 1.5;
  });
}

/* ═══════════════════════════════════════════════════════════
   CROSS-TAB HELPER
   ═══════════════════════════════════════════════════════════ */
export function buildCrossTab<T>(
  items: T[],
  rowKey: keyof T,
  colKey: keyof T,
  valueKey?: keyof T,
): {
  rows: string[];
  cols: string[];
  data: Record<string, Record<string, number>>;
  rowTotals: Record<string, number>;
  colTotals: Record<string, number>;
  grandTotal: number;
} {
  const rowSet = new Set<string>();
  const colSet = new Set<string>();
  const data: Record<string, Record<string, number>> = {};
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const item of items) {
    const r = String(item[rowKey]);
    const c = String(item[colKey]);
    const raw = valueKey ? Number(item[valueKey]) : NaN;
    const v = isFinite(raw) ? raw : 1;

    rowSet.add(r);
    colSet.add(c);

    if (!data[r]) data[r] = {};
    data[r][c] = (data[r][c] || 0) + v;
    rowTotals[r] = (rowTotals[r] || 0) + v;
    colTotals[c] = (colTotals[c] || 0) + v;
    grandTotal += v;
  }

  return {
    rows: Array.from(rowSet).sort(),
    cols: Array.from(colSet).sort(),
    data,
    rowTotals,
    colTotals,
    grandTotal,
  };
}

/* ═══════════════════════════════════════════════════════════
   P&L AUDIT DATA (Domain 10: PL-01 through PL-03)
   ═══════════════════════════════════════════════════════════ */

function generateAuditJobs(): SHAuditJob[] {
  const rng = createRng(777);
  const addresses = ["Oak St", "Pine Ave", "Maple Dr", "Cedar Ln", "Elm Ct", "Birch Way", "Willow Rd", "Cypress Blvd", "Palm Ter", "Magnolia Pl"];
  const audits: SHAuditJob[] = [];

  /* Generate audit data from completed/near-complete jobs */
  const auditableJobs = jobs.filter(j => j.completionPct >= 75);
  for (let i = 0; i < auditableJobs.length; i++) {
    const job = auditableJobs[i];
    const addr = `${rng.between(100, 999)} ${rng.pick(addresses)}`;
    const salePrice = job.contractValue;
    const lotLand = job.lotCost;
    const permitting = rng.between(12000, 22000);
    const siteWork = rng.between(14000, 28000);
    let vertical = rng.between(190000, 250000);
    const options = rng.between(2000, 12000);
    const dirtPad = rng.between(2500, 8000);
    const dumpsters = rng.between(3000, 5500);
    const financing = rng.between(2000, 18000);
    const insurance = rng.between(800, 2500);
    const closingCost = rng.between(800, 4000);
    const well = rng.between(2800, 3500);
    const septic = rng.between(14000, 20000);
    const waterFiltration = rng.between(1395, 3500);
    const gopherTortoise = rng.between(0, 300);
    const treeSurvey = rng.between(200, 350);
    const builderFeePct = rng.between(4, 6) / 100;
    const contingency = rng.between(1000, 5000);
    const builderFee = Math.round(salePrice * builderFeePct);

    // Target realistic residential builder net margin band with occasional outliers.
    const marginRoll = rng.rand();
    const targetNetMarginPct =
      marginRoll < 0.08 ? rng.between(-2, 3) / 100 :   // a few weak/breakeven jobs
      marginRoll < 0.25 ? rng.between(4, 8) / 100 :    // lower-margin jobs
      marginRoll < 0.90 ? rng.between(9, 16) / 100 :   // typical operating band
      rng.between(17, 20) / 100;                       // a few stronger jobs

    const nonVerticalDirect = lotLand + permitting + siteWork + options + dirtPad + dumpsters + well + septic + waterFiltration + gopherTortoise + treeSurvey;
    const totalIndirect = financing + insurance + closingCost;

    const desiredNetProfit = Math.round(salePrice * targetNetMarginPct);
    const desiredTotalCost = Math.round(salePrice - contingency - builderFee - desiredNetProfit);
    const solvedVertical = desiredTotalCost - (nonVerticalDirect + totalIndirect);
    // Keep vertical cost in realistic bounds, but close to the solved target.
    vertical = Math.max(170000, Math.min(320000, solvedVertical));

    const totalDirect = nonVerticalDirect + vertical;
    const totalCost = totalDirect + totalIndirect;
    const commissionPct = 0.05;
    const commission = Math.round(salePrice * commissionPct);
    const closingFee = 1500;
    const loanPayoff = Math.round(totalCost * 0.75); // typical loan covers ~75% of cost
    const proceeds = salePrice - loanPayoff - commission - closingFee;
    const netProfit = salePrice - totalCost - contingency - builderFee;
    const netMargin = salePrice > 0 ? Math.round((netProfit / salePrice) * 1000) / 10 : 0;

    audits.push({
      id: i + 1,
      jobCode: job.jobCode,
      address: `${addr}, ${job.city} FL`,
      community: job.community,
      city: job.city,
      entity: job.entity,
      plan: job.plan,
      jobType: job.completionPct >= 95 ? "Completed" : "Construction",
      salesStatus: job.completionPct >= 95 ? "Closed" : "Under Contract",
      startDate: job.startDate,
      year: new Date(job.startDate).getFullYear(),
      salePrice,
      proceeds,
      sellerCredit: rng.between(0, 5000),
      costToSale: closingCost,
      lotLand,
      permitting,
      siteWork,
      vertical,
      options,
      dirtPad,
      dumpsters,
      financing,
      insurance,
      closingCost,
      well,
      septic,
      waterFiltration,
      gopherTortoise,
      treeSurvey,
      totalDirectCost: totalDirect,
      totalIndirectCost: totalIndirect,
      totalCost,
      contingency,
      builderFee,
      builderFeePct: Math.round(builderFeePct * 1000) / 10,
      netProfit,
      netMargin,
    });
  }
  return audits;
}

export const auditJobs: SHAuditJob[] = generateAuditJobs();

export function getAuditKPIs(filteredAudits: SHAuditJob[]) {
  const count = filteredAudits.length;
  const totalRevenue = filteredAudits.reduce((s, a) => s + a.salePrice, 0);
  const totalCost = filteredAudits.reduce((s, a) => s + a.totalCost, 0);
  const totalProfit = filteredAudits.reduce((s, a) => s + a.netProfit, 0);
  const avgMargin = count ? filteredAudits.reduce((s, a) => s + a.netMargin, 0) / count : 0;
  const atRisk = filteredAudits.filter(a => a.netMargin < 0).length;
  return { count, totalRevenue, totalCost, totalProfit, avgMargin, atRisk };
}

export function getAuditCostBreakdown(filteredAudits: SHAuditJob[]) {
  return [
    { label: "Vertical",                  value: filteredAudits.reduce((s, a) => s + a.vertical, 0),    color: "#0f766e" },
    { label: "Lot / Land",                value: filteredAudits.reduce((s, a) => s + a.lotLand, 0),     color: "#14b8a6" },
    { label: "Site Work",                 value: filteredAudits.reduce((s, a) => s + a.siteWork, 0),    color: "#22d3ee" },
    { label: "Permitting & Fees",         value: filteredAudits.reduce((s, a) => s + a.permitting + a.financing, 0), color: "#3b82f6" },
    { label: "Utilities & Infrastructure", value: filteredAudits.reduce((s, a) => s + a.dirtPad + a.dumpsters + a.well + a.septic + a.waterFiltration, 0), color: "#6366f1" },
    { label: "Other",                     value: filteredAudits.reduce((s, a) => s + a.insurance + a.closingCost + a.options + a.gopherTortoise + a.treeSurvey, 0), color: "#64748b" },
  ];
}

/* ═══════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════ */
export { COMMUNITIES, CITIES, COUNTIES, ENTITIES, PLANS, SUPERS, STAGES, LENDERS, AGENTS, COMM_META, CITY_COUNTY, LOT_COSTS };
