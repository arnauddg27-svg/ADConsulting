import type { Service, NavLink, Stat, Testimonial } from "@/types";

export const SITE_CONFIG = {
  name: "A.D. Homes & Consulting",
  businessName: "A.D. Homes & Consulting",
  tagline: "Custom Operating Systems for Builders.",
  description:
    "We build custom data ecosystems for residential home builders in Central Florida — automated ingestion, centralized data, and functional applications that replace spreadsheets and disconnected ERPs.",
  location: "Orlando & Central Florida",
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
    id: "profitability",
    title: "Job Profitability Console",
    shortTitle: "Job Profitability",
    headline: "Budget vs. actuals, cost code variances, and margin flags — in real time",
    description:
      "Stop waiting for closings to find out where margin went. Track budget vs. actuals, cost code variances, and margin pressure across every job and community so leadership can act before problems compound.",
    icon: "DollarSign",
    deliverables: [
      "Budget vs. actual tracking by job and community",
      "Cost code variance and exception flags",
      "Margin trend analysis with early-warning alerts",
      "Community profitability comparisons",
      "Projected final cost and margin at completion",
      "Automated weekly cost movement reports",
    ],
  },
  {
    id: "pipeline",
    title: "Lot Pipeline Board",
    shortTitle: "Lot Pipeline",
    headline: "Full visibility into starts, completions, and bottlenecks across every community",
    description:
      "See exactly where every lot stands — from permit to closing — with bottleneck flags that show where jobs are stalling. Production pacing, phase duration tracking, and superintendent workload views keep the field and the office on the same page.",
    icon: "Layers",
    deliverables: [
      "Visual lot-by-lot pipeline across all communities",
      "Start-to-close cycle time tracking",
      "Phase duration and bottleneck detection",
      "Superintendent workload and capacity views",
      "Production pacing vs. absorption targets",
      "Stale-job and aging alerts",
    ],
  },
  {
    id: "vendor",
    title: "Vendor Scorecard",
    shortTitle: "Vendor Scorecard",
    headline: "Trade performance, defects, and pricing analysis — not just gut feel",
    description:
      "Replace gut-feel vendor decisions with data. Track trade performance across cost, quality, and timeline metrics. Identify which subs are costing you money, which are reliable, and where renegotiation or replacement makes sense.",
    icon: "Users",
    deliverables: [
      "Vendor performance scoring (cost, quality, timeline)",
      "Defect and callback tracking by trade",
      "Cost comparison across vendors and communities",
      "Schedule compliance and delay attribution",
      "Rebid and renegotiation trigger alerts",
      "Historical trend analysis by trade category",
    ],
  },
  {
    id: "exceptions",
    title: "Exception Center",
    shortTitle: "Exception Center",
    headline: "Flags delayed jobs, missing data, and stale updates before they become problems",
    description:
      "Surface the issues that slip through the cracks. Automatically flag jobs with stale updates, missing milestones, data gaps, and schedule drift so your team can fix problems the same week they appear — not months later at closing.",
    icon: "AlertTriangle",
    deliverables: [
      "Delayed job and missed milestone alerts",
      "Missing data and incomplete record flags",
      "Stale update detection (no activity in X days)",
      "Schedule drift and slippage tracking",
      "Exception dashboards by superintendent and community",
      "Automated escalation notifications",
    ],
  },
  {
    id: "sales",
    title: "Sales & Backlog Console",
    shortTitle: "Sales & Backlog",
    headline: "Sales pace, backlog health, and community performance in one view",
    description:
      "Track sales pace against absorption targets, monitor backlog health, and compare community performance side by side. Give leadership the confidence to adjust pricing, release lots, or shift marketing spend based on real numbers.",
    icon: "TrendingUp",
    deliverables: [
      "Sales pace tracking vs. absorption targets",
      "Backlog aging and conversion analysis",
      "Community performance comparison",
      "Pricing sensitivity and adjustment signals",
      "Contract-to-close timeline tracking",
      "Monthly and quarterly trend reports",
    ],
  },
  {
    id: "admin",
    title: "Admin & Data Correction Tools",
    shortTitle: "Admin Tools",
    headline: "Fix statuses, notes, and mappings directly — without calling IT",
    description:
      "Give your team the ability to correct data issues, update statuses, and fix mappings in real time through simple, controlled interfaces. No more emailing IT or waiting for someone to update the ERP manually.",
    icon: "Wrench",
    deliverables: [
      "Status and phase correction screens",
      "Lot and job data cleanup interfaces",
      "Vendor and cost code mapping tools",
      "Notes and annotation management",
      "Audit trail for all corrections",
      "Role-based access controls",
    ],
  },
];

export const STATS: Stat[] = [];

export const TESTIMONIALS: Testimonial[] = [];

export const PROCESS_STEPS = [
  {
    step: 1,
    title: "Discovery Call",
    description:
      "30-minute conversation to understand your pain points, current systems, and where the biggest operational drag lives.",
  },
  {
    step: 2,
    title: "Systems Mapping",
    description:
      "A technical deep-dive into your actual workflows, data quality, and system setup to identify exactly what needs to change.",
  },
  {
    step: 3,
    title: "Implementation",
    description:
      "We build and deploy your custom operating system — automated data flows, centralized reporting, and functional tools your team actually uses.",
  },
  {
    step: 4,
    title: "Ongoing Support",
    description:
      "Post-launch retainer to maintain pipelines, refine applications, and evolve the system as your operation grows.",
  },
];
