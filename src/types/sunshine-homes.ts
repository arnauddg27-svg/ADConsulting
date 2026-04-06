/* ── Sunshine Homes Demo Dashboard Types ── */

export type SHJobType = "Lot" | "Permitting" | "Construction" | "Completed" | "Closed";

export interface SHJob {
  id: number;
  jobCode: string;
  lot: string;
  community: string;
  city: string;
  county: string;
  entity: string;
  plan: string;
  superintendent: string;
  jobType: SHJobType;
  stage: string;
  completionPct: number;
  startDate: string;
  estCompletion: string;
  contractValue: number;
  estimatedCost: number;
  actualCostToDate: number;
  wipBalance: number;
  lotCost: number;
  originalBudget: number;
  projectedFinalCost: number;
  margin: number;
  marginPct: number;
  daysInCurrentPhase: number;
  totalCycleDays: number;
  /* cost category breakdowns (budget vs actual) */
  permittingBudget: number;
  permittingActual: number;
  sidewalkBudget: number;
  sidewalkActual: number;
  verticalBudget: number;
  verticalActual: number;
  /* milestone dates */
  permitDate: string | null;
  foundationDate: string | null;
  framingDate: string | null;
  mepDate: string | null;
  drywallDate: string | null;
  finishesDate: string | null;
  coDate: string | null;
  closingDate: string | null;
}

export interface SHSale {
  id: number;
  jobCode: string;
  community: string;
  city: string;
  entity: string;
  plan: string;
  buyer: string;
  agent: string;
  salePrice: number;
  contractDate: string;
  closingDate: string | null;
  status: "active" | "pending" | "closed" | "cancelled";
}

export interface SHLoan {
  id: number;
  jobCode: string;
  community: string;
  city: string;
  lender: string;
  loanAmount: number;
  totalDrawn: number;
  drawPct: number;
  interestRate: number;
  expirationDate: string;
  daysUntilExpiration: number;
}

export interface SHLandDeal {
  id: number;
  name: string;
  city: string;
  county: string;
  community: string;
  acres: number;
  lots: number;
  acquisitionCost: number;
  costPerLot: number;
  status: "under-contract" | "closed" | "cancelled";
  closeDate: string | null;
  contractDate: string;
  year: number;
}

export interface SHPermit {
  id: number;
  jobCode: string;
  community: string;
  city: string;
  permitType: string;
  permitSubType: string;
  submittedDate: string;
  approvedDate: string | null;
  issuedDate: string | null;
  daysInReview: number;
  status: "approved" | "in-review" | "pending" | "rejected" | "issued";
  year: number;
}

export interface SHPropertyUnit {
  id: number;
  address: string;
  community: string;
  city: string;
  entity: string;
  bedsBaths: string;
  sqft: number;
  monthlyRent: number;
  marketRent: number;
  deposit: number;
  managementPct: number;
  occupancy: "leased" | "vacant" | "make-ready" | "eviction" | "notice-to-vacate";
  tenant: string | null;
  leaseEnd: string | null;
  delinquentAmount: number;
  daysPastDue: number;
}

export interface SHSubdivision {
  id: number;
  projectName: string;
  community: string;
  city: string;
  entity: string;
  totalLots: number;
  lotsSold: number;
  lotsUnderConstruction: number;
  lotsCompleted: number;
  lotsRemaining: number;
  totalAcres: number;
  landCost: number;
  developmentCost: number;
  totalInvestment: number;
  projectedRevenue: number;
  projectedProfit: number;
  profitMarginPct: number;
  status: "active" | "pre-development" | "sold-out" | "planning";
  startDate: string;
  estCompletionDate: string;
  infraComplete: boolean;
  zoningApproved: boolean;
  platRecorded: boolean;
  utilityStubs: boolean;
  roadsComplete: boolean;
  retentionPonds: boolean;
  avgLotPrice: number;
  avgHomePrice: number;
  absorptionRate: number;
  monthsOfInventory: number;
}

export type SHTimePeriod = "all" | "month" | "quarter" | "year";

export interface SHDashboardFilters {
  city: string | null;
  jobType: string | null;
  entity: string | null;
  community: string | null;
  stage: string | null;
  timePeriod: SHTimePeriod;
}

/* ── P&L Audit Types (Domain 10) ── */
export interface SHAuditJob {
  id: number;
  jobCode: string;
  address: string;
  community: string;
  city: string;
  entity: string;
  plan: string;
  jobType: string;
  salesStatus: string;
  salePrice: number;
  /* Revenue */
  proceeds: number;
  sellerCredit: number;
  costToSale: number;
  /* Direct Costs */
  lotLand: number;
  permitting: number;
  siteWork: number;
  vertical: number;
  options: number;
  dirtPad: number;
  dumpsters: number;
  /* Indirect Costs */
  financing: number;
  insurance: number;
  closingCost: number;
  /* Utilities & Environmental */
  well: number;
  septic: number;
  waterFiltration: number;
  gopherTortoise: number;
  treeSurvey: number;
  /* Derived */
  totalDirectCost: number;
  totalIndirectCost: number;
  totalCost: number;
  contingency: number;
  builderFee: number;
  builderFeePct: number;
  netProfit: number;
  netMargin: number;
}

export type SHSection =
  | "land"
  | "permitting"
  | "loans"
  | "construction"
  | "sales"
  | "property-mgmt"
  | "audits";

export type SHTab =
  | "land-dashboard"
  | "land-pipeline"
  | "land-subdivisions"
  | "permitting-dashboard"
  | "permitting-pipeline"
  | "loans-dashboard"
  | "loans-pipeline"
  | "construction-dashboard"
  | "construction-pipeline"
  | "construction-cycle"
  | "construction-cost"
  | "construction-subdivisions"
  | "sales-dashboard"
  | "sales-pipeline"
  | "pm-dashboard"
  | "pm-pipeline"
  | "audits-dashboard"
  | "audits-pipeline";

export interface SHSectionDef {
  id: SHSection;
  label: string;
  tabs: { id: SHTab; label: string }[];
}

/* ── Cycle Time derived types ── */
export interface SHCycleTimeByCity {
  city: string;
  phases: { phase: string; days: number; color: string }[];
  total: number;
  jobCount: number;
}

export interface SHCycleTimeTrendPoint {
  period: string;
  avgDays: number;
  jobCount: number;
  jobs: SHJob[];
}

export interface SHMilestoneSparkline {
  city: string;
  current: number;
  goal: number;
  data: number[];
  status: "on-track" | "at-risk" | "behind";
}
