import type { SHSectionDef } from "@/types/sunshine-homes";

export const SH_SECTIONS: SHSectionDef[] = [
  { id: "land", label: "LAND", tabs: [
    { id: "land-dashboard", label: "Dashboard" },
    { id: "land-pipeline", label: "Pipeline" },
  ]},
  { id: "permitting", label: "PERMITTING", tabs: [
    { id: "permitting-dashboard", label: "Dashboard" },
    { id: "permitting-pipeline", label: "Pipeline" },
  ]},
  { id: "loans", label: "LOANS", tabs: [
    { id: "loans-dashboard", label: "Dashboard" },
    { id: "loans-pipeline", label: "Pipeline" },
  ]},
  { id: "construction", label: "CONSTRUCTION", tabs: [
    { id: "construction-dashboard", label: "Dashboard" },
    { id: "construction-pipeline", label: "Pipeline" },
    { id: "construction-cycle", label: "Cycle Time" },
    { id: "construction-cost", label: "Cost Metrics" },
    { id: "construction-subdivisions", label: "Subdivisions" },
  ]},
  { id: "sales", label: "SALES", tabs: [
    { id: "sales-dashboard", label: "Dashboard" },
    { id: "sales-pipeline", label: "Pipeline" },
  ]},
  { id: "property-mgmt", label: "PROPERTY MGMT", tabs: [
    { id: "pm-dashboard", label: "Dashboard" },
    { id: "pm-pipeline", label: "Pipeline" },
  ]},
  { id: "audits", label: "AUDITS", tabs: [
    { id: "audits-dashboard", label: "P&L Dashboard" },
    { id: "audits-pipeline", label: "Job Audits" },
  ]},
];

export const SH_COMMUNITIES = [
  "Sunshine Ridge",
  "Palm Coast Estates",
  "Emerald Bay",
  "Coral Springs Village",
  "Magnolia Park",
  "Cypress Landing",
  "Lake Nona Shores",
  "Riverview Heights",
] as const;

export const SH_CITIES = ["Orlando", "Tampa", "Jacksonville", "Lakeland"] as const;

export const SH_ENTITIES = ["Builder Sample LLC", "Builder Sample East LLC"] as const;

export const SH_STAGES = ["Permit", "Foundation", "Framing", "MEP / Drywall", "Finishes", "Closing"] as const;
