import type { Service, NavLink, Stat, Testimonial } from "@/types";

export const SITE_CONFIG = {
  name: "A.D. Homes & Consulting",
  businessName: "A.D. Homes & Consulting",
  tagline: "Operations Consulting for Builders.",
  description:
    "Operations consulting for Central Florida builders and development firms. Dashboards, KPI reporting, financial modeling, and ERP/process improvement.",
  location: "Central Florida",
  phone: "(407) 840-1368",
  email: "arnauddg27@gmail.com",
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Sample", href: "/demo/" },
  { label: "Contact", href: "/contact/" },
];

export const SERVICES: Service[] = [
  {
    id: "dashboards",
    title: "Dashboards, KPIs & Reporting",
    shortTitle: "Dashboards & KPIs",
    headline: "Build a reporting system leadership can actually run on",
    description:
      "Power BI dashboards and KPI systems that turn scattered operating data into a weekly management view. Track cost by plan, margin trends, vendor variance, cycle times, and community profitability with reporting that is automated, consistent, and decision-ready.",
    icon: "BarChart3",
    deliverables: [
      "Custom Power BI dashboard design and deployment",
      "Lot-to-close KPI framework",
      "Job cost trend and margin reporting",
      "Critical-path and cycle-time tracking",
      "Vendor performance and variance reporting",
      "Automated weekly and monthly reporting",
    ],
  },
  {
    id: "financial",
    title: "Financial Modeling & Underwriting",
    shortTitle: "Financial Modeling",
    headline: "Pressure-test deals, pricing, and margin before they get expensive",
    description:
      "Land proformas, lot grading, and mid-construction underwriting that help you pressure-test deals before capital is committed and re-verify margin as conditions change. Scenario modeling gives leadership a clearer read on pricing, absorption, inflation, and cash-flow risk.",
    icon: "Calculator",
    deliverables: [
      "Pre-acquisition land proformas with lot grading",
      "Mid-construction underwriting and margin re-checks",
      "Scenario modeling for inflation, repricing, and absorption",
      "Plan mix and pricing analysis",
      "Draw schedule and cash flow modeling",
      "Sensitivity analysis and risk review",
    ],
  },
  {
    id: "operations",
    title: "ERP Optimization & Process Improvement",
    shortTitle: "ERP & Process",
    headline: "Make the system support the way the team actually works",
    description:
      "Most builders use only a fraction of what their ERP can do. We audit the setup, clean up cost codes, streamline PO workflows, standardize schedules, and align the team around repeatable processes so the system supports the operation instead of slowing it down.",
    icon: "Settings",
    deliverables: [
      "ERP audit, cost code cleanup, and configuration",
      "PO-based purchasing workflows",
      "Standard construction schedule templates",
      "Permitting tracking and follow-up workflows",
      "Data integrity cleanup",
      "Team training and adoption support",
    ],
  },
];

export const STATS: Stat[] = [];

export const TESTIMONIALS: Testimonial[] = [];

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Discovery",
    description:
      "Learn the operation, the team, and the decision bottlenecks. No generic assessment.",
  },
  {
    step: 2,
    title: "Assessment",
    description:
      "Pinpoint where the real drag sits: reporting, process, system setup, or handoff breakdowns.",
  },
  {
    step: 3,
    title: "Implementation",
    description:
      "Build the dashboards, models, workflows, and fixes that solve the problem instead of just describing it.",
  },
  {
    step: 4,
    title: "Optimization",
    description:
      "Refine the system in real use so it stays useful after rollout, not just at handoff.",
  },
];
