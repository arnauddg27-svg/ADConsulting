export interface Service {
  id: string;
  title: string;
  shortTitle: string;
  headline: string;
  description: string;
  icon: string;
  deliverables: string[];
}

export interface Project {
  id: number;
  name: string;
  phase: string;
  percentComplete: number;
  status: "on-track" | "at-risk" | "behind";
  daysRemaining: number;
  budget: number;
  spent: number;
}

export interface BudgetDataPoint {
  month: string;
  planned: number;
  actual: number;
}

export interface CostCategory {
  category: string;
  value: number;
  color: string;
}

export interface Milestone {
  name: string;
  date: string;
  status: "complete" | "in-progress" | "upcoming";
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  company: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface JobProfitability {
  id: number;
  project: string;
  contractValue: number;
  estimatedCost: number;
  actualCostToDate: number;
  projectedFinalCost: number;
  estimatedMargin: number;
  status: "healthy" | "watch" | "eroding";
}
