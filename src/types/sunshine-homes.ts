/* ── Sunshine Homes Demo Dashboard Types ── */

export interface SHJob {
  id: number;
  jobCode: string;
  lot: string;
  community: string;
  city: string;
  entity: string;
  plan: string;
  superintendent: string;
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
  plan: string;
  buyer: string;
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
  community: string;
  acres: number;
  lots: number;
  acquisitionCost: number;
  costPerLot: number;
  status: "under-contract" | "closed" | "cancelled";
  closeDate: string | null;
}

export interface SHPermit {
  id: number;
  jobCode: string;
  community: string;
  city: string;
  permitType: string;
  submittedDate: string;
  approvedDate: string | null;
  daysInReview: number;
  status: "approved" | "in-review" | "pending" | "rejected";
}

export interface SHPropertyUnit {
  id: number;
  address: string;
  community: string;
  city: string;
  bedsBaths: string;
  sqft: number;
  monthlyRent: number;
  marketRent: number;
  occupancy: "leased" | "vacant" | "make-ready" | "eviction";
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
  absorptionRate: number; // sales per month
  monthsOfInventory: number;
}

export interface SHDashboardFilters {
  city: string | null;
  jobType: string | null;
  entity: string | null;
  community: string | null;
}

export type SHSection =
  | "land"
  | "permitting"
  | "loans"
  | "construction"
  | "sales"
  | "property-mgmt";

export type SHTab =
  | "land-dashboard"
  | "land-subdivisions"
  | "permitting-dashboard"
  | "loans-dashboard"
  | "construction-dashboard"
  | "construction-pipeline"
  | "construction-cycle"
  | "construction-cost"
  | "sales-dashboard"
  | "pm-dashboard";

export interface SHSectionDef {
  id: SHSection;
  label: string;
  tabs: { id: SHTab; label: string }[];
}
