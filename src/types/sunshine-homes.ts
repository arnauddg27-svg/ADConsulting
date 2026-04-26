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
  year: number;
  /* cost category breakdowns (budget vs actual) */
  permittingBudget: number;
  permittingActual: number;
  sidewalkBudget: number;
  sidewalkActual: number;
  verticalBudget: number;
  verticalActual: number;
  /* high-level phase dates (kept for back-compat with existing drilldowns) */
  permitDate: string | null;
  foundationDate: string | null;
  framingDate: string | null;
  mepDate: string | null;
  drywallDate: string | null;
  finishesDate: string | null;
  coDate: string | null;
  closingDate: string | null;
  /* ── Milestone fields aligned with Centralized Data 2.0 / Construction sheet ──
     Marked optional so other SHJob[] datasets (Brite Homes etc.) that
     pre-date the schema can compile without backfilling 30+ fields. The
     Sunshine generator populates them in full. */
  lastMilestoneCompleted?: string | null;
  dateLastMilestoneCompleted?: string | null;
  daysSinceLastMilestone?: number;
  furthestMilestoneCompleted?: string | null;
  dateFurthestMilestoneCompleted?: string | null;
  nextStageDate?: string | null;
  offTrack?: "on" | "ahead" | "behind";
  daysOnOffTrack?: number;
  ctBetweenMilestones?: number;
  goalCycleDays?: number;
  /* 22 granular milestone dates (cols 77-98 of Construction sheet) */
  msJobStart?: string | null;          // 1%
  msClearLot?: string | null;          // 5%
  msBuildPad?: string | null;          // 10%
  msUndergroundPlumbing?: string | null; // 15%
  msPourSlab?: string | null;          // 20%
  msBlockHouse?: string | null;        // 25%
  msFrameHouse?: string | null;        // 30%
  msDryInRoof?: string | null;         // 35%
  msElectricalRoughIn?: string | null; // 40%
  msInsulateHouse?: string | null;     // 45%
  msDrywallHouse?: string | null;      // 50%
  msFirstTrim?: string | null;         // 55%
  msFirstInteriorPaint?: string | null;// 60%
  msFlooringInstall?: string | null;   // 65%
  msCabinetInstall?: string | null;    // 70%
  msElectricalTrimout?: string | null; // 75%
  msHotCheck?: string | null;          // 80%
  msAcStartup?: string | null;         // 85%
  msFinalExteriorPaint?: string | null;// 90%
  msFinalSurvey?: string | null;       // 95%
  msFinalSiteCleanup?: string | null;  // 98%
  msReceiveCO?: string | null;         // 100%
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
  year: number;
  /* ── Sales-sheet contract fields (Centralized Data 2.0) ──
     All optional for back-compat with any older data sources. */
  /* Buyer detail */
  coBuyer?: string | null;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerCity?: string;
  buyerState?: string;
  /* Sale-event dates */
  writtenDate?: string | null;
  soldDate?: string | null;
  acceptedDate?: string | null;
  cancelDate?: string | null;
  cancelReason?: string | null;
  /* Pricing */
  basePrice?: number;
  lotPremium?: number;
  changeOrders?: number;
  salesIncentive?: number;
  solarPackage?: number;
  totalPrice?: number;        // Base + Lot Premium + Change Orders + Discretionary
  /* Money flow */
  totalDeposits?: number;
  closingCost?: number;
  /* Closing schedule */
  promisedDate?: string | null;
  projectedCloseDate?: string | null;
  scheduledCloseDate?: string | null;
  /* Margins */
  netProfitEst?: number;
  netMarginEst?: number;       // percentage
  /* Sales team / channel */
  realtorCompany?: string;
  realtor?: string;
  saleSource?: "Walk-in" | "MLS" | "Referral" | "Website" | "Repeat Buyer" | "Builder Show" | "Other";
  /* Financing */
  mortgageCompany?: string;
  mortgageContact?: string;
  loanType?: "Conventional" | "FHA" | "VA" | "USDA" | "Cash" | "Builder Financing";
  loanApplicationDate?: string | null;
  loanApprovedDate?: string | null;
  /* Title */
  titleCompany?: string;
  titleContact?: string;
  /* Contingency */
  contingentSale?: boolean;
  contingentAddress?: string;
  contingentDeliveryDate?: string | null;
  contingencyRemovedDate?: string | null;
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
  startDate: string;
  expirationDate: string;
  daysUntilExpiration: number;
  year: number;
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
  /* ── Permitting-sheet fields (Centralized Data 2.0) — all optional ── */
  /* Identity / location */
  parcelId?: string;
  permitNumber?: string;
  lotBlockSection?: string;
  /* People */
  clerk?: string;
  surveyor?: string;
  /* Status detail */
  envIssues?: string;          // "None" / specific issue
  furthestMilestone?: string;
  /* Dates beyond submitted/approved/issued */
  expirationDate?: string | null;
  noCRecordedDate?: string | null;     // NOC Date Recorded
  surveyOrderedDate?: string | null;
  certOfOccupancyDate?: string | null;
  dayCheckRequestedDate?: string | null;
  dayCheckMailedDate?: string | null;
  /* Per-step cycle times (in days) — drives the permitting funnel chart */
  surveyCT?: number;
  septicPermitCT?: number;
  plansCT?: number;
  trussesCT?: number;
  energyCalcsCT?: number;
  permitCT?: number;
  totalCycleTime?: number;
  /* Misc */
  permitFeeAmount?: number;
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
  leaseStart: string;
  leaseEnd: string | null;
  delinquentAmount: number;
  daysPastDue: number;
  year: number;
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
  status: string | null;          // status/occupancy cross-filter
  drillYear: number | null;       // date drill: year level
  drillQuarter: number | null;    // date drill: quarter level
  drillMonth: number | null;      // date drill: month level
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
  startDate: string;
  year: number;
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
