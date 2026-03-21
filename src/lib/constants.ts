import type { Service, NavLink, Stat, Testimonial } from "@/types";

export const SITE_CONFIG = {
  name: "A.D. Homes & Consulting",
  businessName: "A.D. Homes & Consulting",
  tagline: "Custom Data Ecosystems & Analytics Platforms for Residential Homebuilders.",
  description:
    "A.D. Homes & Consulting builds custom operational intelligence platforms for residential homebuilders across North America. We extract data from builder ERPs, spreadsheets, and finance systems, centralize it in a warehouse, and deliver interactive applications from land acquisition through audits.",
  location: "North America (U.S. & Canada)",
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
    id: "ingestion",
    title: "Automated Ingestion Engine",
    shortTitle: "Data Extraction",
    headline: "Pull data out of Buildertrend, Hyphen, Sage, JME, Sheets, and exports automatically",
    description:
      "Every platform starts with extraction. We map the builder's actual systems of record, set up the right connectors or import scripts, and automate the movement of ERP, spreadsheet, and operational data into a structure the business can trust.",
    icon: "Wrench",
    deliverables: [
      "ERP extraction strategy by source system",
      "Automated syncs for CSV, XLSX, Sheets, or API data",
      "Raw staging tables with source-level validation",
      "Data mapping and cleanup documentation",
      "Refresh schedules and monitoring rules",
      "Handoff notes for ongoing support",
    ],
  },
  {
    id: "warehouse",
    title: "Central Data Warehouse",
    shortTitle: "Warehouse",
    headline: "One cloud data foundation for KPI logic, filters, reporting, and auditability",
    description:
      "We centralize the builder's data in BigQuery, Snowflake, or Microsoft Fabric with separate raw and mart layers. KPI logic lives in the warehouse so the numbers stay consistent across finance, construction, sales, and leadership.",
    icon: "Layers",
    deliverables: [
      "Raw and mart datasets organized for speed and auditability",
      "Pre-computed KPI and filter tables",
      "Warehouse SQL or dbt-style modeling",
      "Daily refresh scripts and validation checks",
      "Cost-conscious infrastructure design",
      "Client-owned architecture and documentation",
    ],
  },
  {
    id: "builder-ops",
    title: "Builder Ops Console",
    shortTitle: "Builder Ops",
    headline: "Interactive applications organized around the builder lifecycle, not generic BI tabs",
    description:
      "The application layer is built around how the business actually runs. Instead of a read-only dashboard, the team gets a platform with drill-downs, pipeline tables, filters, and operating views that support daily decisions.",
    icon: "TrendingUp",
    deliverables: [
      "Interactive Next.js dashboards and operating views",
      "Drill-downs by city, community, job, or superintendent",
      "Spreadsheet-grade pipeline tables",
      "Executive and department-level visibility",
      "Responsive layouts for desktop review and field use",
      "Production-ready deployment and walkthroughs",
    ],
  },
  {
    id: "lifecycle",
    title: "Lifecycle Dashboards",
    shortTitle: "Lifecycle Views",
    headline: "Land, permitting, loans, construction, sales, and portfolio views in one connected system",
    description:
      "Off-the-shelf tools usually show only one slice of the operation. We organize the platform around the full builder lifecycle so leadership can move from acquisition through closing and beyond without changing systems or definitions.",
    icon: "Users",
    deliverables: [
      "Land acquisition and subdivision pipeline views",
      "Permitting status, cycle times, and stuck-permit alerts",
      "Loan exposure, draws, and expiration tracking",
      "Construction stage, cycle time, and stall analysis",
      "Sales backlog, revenue, and per-job P&L views",
      "Property management and portfolio reporting where needed",
    ],
  },
  {
    id: "pro-forma",
    title: "Per-Job Pro Forma & Audit Tools",
    shortTitle: "Pro Forma",
    headline: "Configurable job-level financial views that catch margin erosion before closing",
    description:
      "Builders need more than community-level summaries. We build per-job financial tools that combine cost, pricing, contingency, and operational data into usable views for underwriting, audits, and margin protection.",
    icon: "DollarSign",
    deliverables: [
      "Per-job pro forma P&L views",
      "Budget vs. actual and variance analysis",
      "Configurable cost defaults and assumptions",
      "At-risk job and exception flagging",
      "Audit-ready calculations and reference tables",
      "Inline-edit admin settings where appropriate",
    ],
  },
  {
    id: "data-quality",
    title: "Data Quality Monitor & Admin Controls",
    shortTitle: "Admin Tools",
    headline: "Freshness checks, exception alerts, and controlled admin tools to keep the platform reliable",
    description:
      "A builder platform only stays useful if the data stays clean. We add monitoring, exception logic, and practical admin controls so missing records, stale syncs, and broken assumptions surface quickly instead of lingering in the background.",
    icon: "AlertTriangle",
    deliverables: [
      "Data freshness indicators and sync health checks",
      "Column coverage and completeness monitoring",
      "Exception center alerts by role or workflow",
      "Admin settings for pro forma and reference defaults",
      "Role-aware operational controls",
      "Documentation for ownership and ongoing maintenance",
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
      "A 30-minute conversation focused on where spreadsheets, stale reporting, or ERP gaps are costing time and margin.",
  },
  {
    step: 2,
    title: "Systems Mapping",
    description:
      "A technical review of source systems, data quality, KPI requirements, and the right extraction path for the builder's environment.",
  },
  {
    step: 3,
    title: "Platform Build",
    description:
      "Warehouse, mart logic, and application views are delivered in working iterations so the platform improves with real feedback.",
  },
  {
    step: 4,
    title: "Handoff & Support",
    description:
      "Training, documentation, production rollout, and optional monthly support to keep the system useful as operations evolve.",
  },
];
