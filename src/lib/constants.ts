import type { Service, NavLink, Stat, Testimonial } from "@/types";

export const SITE_CONFIG = {
  name: "AD ERP SYSTEMS",
  businessName: "AD ERP SYSTEMS",
  legalName: "AD ERP SYSTEMS",
  tagline: "Builder Reporting for Schedule, Budget, and Margin",
  description:
    "AD ERP SYSTEMS helps residential builders and developers improve schedule visibility, variance control, and margin protection with daily dashboards built from the systems they already use.",
  location: "North America (U.S. & Canada)",
  businessAddress: "2660 Almondwood Loop, Orlando, FL 32821, United States",
  email: "adurand@aderpsystems.com",
  calendlyUrl: "https://calendly.com/d/cvp6-gwc-x68",
};

export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services/" },
  { label: "About", href: "/about/" },
  { label: "Sample", href: "/examples/" },
  { label: "Contact", href: "/contact/" },
];

export const SERVICES: Service[] = [
  {
    id: "ingestion",
    title: "Automated Ingestion Engine",
    shortTitle: "Data Extraction",
    headline: "Pull data out of Buildertrend, Hyphen, Sage, JME, Sheets, and exports automatically",
    description:
      "Every operating review starts with extraction. We map the builder or developer's actual systems of record, set up the right connectors or import scripts, and automate the movement of ERP, spreadsheet, and operational data into a structure the business can trust.",
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
      "Your data lands in a cloud warehouse configured for your reporting needs, organized into raw and analytics layers. KPI logic lives in the warehouse so finance, construction, sales, and leadership all read the same numbers.",
    icon: "Layers",
    deliverables: [
      "Raw and analytics layers organized for speed and auditability",
      "Pre-computed KPI and filter tables",
      "Modular SQL transformations under version control",
      "Scheduled refreshes and validation checks",
      "Cost-conscious infrastructure design",
      "Architecture and documentation for ongoing support",
    ],
  },
  {
    id: "builder-ops",
    title: "Reporting Systems & Operational Coverage",
    shortTitle: "Reporting Systems",
    headline: "Daily reporting systems that cover land through closeout in one connected view",
    description:
      "We build reporting systems teams use daily — drill-downs and operating reviews instead of static BI tabs — organized across the full operation so teams move from acquisition through closeout without switching systems or definitions.",
    icon: "TrendingUp",
    deliverables: [
      "Interactive web dashboards and operating reviews",
      "Drill-downs by city, community, job, or superintendent",
      "Land, permitting, loan, and construction pipeline views",
      "Sales backlog, revenue, and per-job P&L views",
      "Executive and department-level visibility",
      "Responsive layouts for desktop review and field use",
    ],
  },
  {
    id: "data-quality",
    title: "Data Quality Monitor & Admin Controls",
    shortTitle: "Admin Tools",
    headline: "Freshness checks, exception alerts, and controlled admin tools to keep reporting reliable",
    description:
      "Reporting only stays useful if the data stays clean. We add monitoring, exception logic, and practical admin controls so missing records, stale syncs, and broken assumptions surface quickly instead of lingering in the background.",
    icon: "AlertTriangle",
    deliverables: [
      "Data freshness indicators and sync health checks",
      "Column coverage and completeness monitoring",
      "Exception center alerts by role or workflow",
      "Admin settings for reporting and reference defaults",
      "Role-aware operational controls",
      "Documentation for responsibility and ongoing maintenance",
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
      "A 30-minute conversation focused on current systems, reporting gaps, and where teams are relying on manual workarounds.",
  },
  {
    step: 2,
    title: "Systems Mapping",
    description:
      "A technical review of source systems, data quality, KPI definitions, and the right extraction and warehouse approach.",
  },
  {
    step: 3,
    title: "Platform Build",
    description:
      "Extraction pipelines, warehouse models, reporting systems, and tools are delivered in working iterations with feedback.",
  },
  {
    step: 4,
    title: "Handoff & Support",
    description:
      "Training, documentation, production rollout, and optional support for ongoing reporting and operational needs.",
  },
];
