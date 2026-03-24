/* ── Sunshine Homes Demo Data ──
   Static mock data for the marketing-site dashboard demo.
   All numbers are realistic for a mid-size Florida production builder. */

import type {
  SHJob, SHSale, SHLoan, SHLandDeal, SHPermit, SHPropertyUnit, SHSubdivision,
  SHDashboardFilters, SHSectionDef,
} from "@/types/sunshine-homes";

/* ─── Navigation ─── */
export const SECTIONS: SHSectionDef[] = [
  { id: "land",        label: "LAND",         tabs: [
    { id: "land-dashboard",    label: "Dashboard" },
    { id: "land-subdivisions", label: "Subdivisions" },
  ]},
  { id: "permitting",  label: "PERMITTING",   tabs: [{ id: "permitting-dashboard",   label: "Dashboard" }] },
  { id: "loans",       label: "LOANS",        tabs: [{ id: "loans-dashboard",        label: "Dashboard" }] },
  { id: "construction",label: "CONSTRUCTION", tabs: [
    { id: "construction-dashboard", label: "Dashboard" },
    { id: "construction-pipeline",  label: "Pipeline"  },
    { id: "construction-cycle",     label: "Cycle Time" },
    { id: "construction-cost",      label: "Cost Metrics" },
  ]},
  { id: "sales",       label: "SALES",        tabs: [{ id: "sales-dashboard",        label: "Dashboard" }] },
  { id: "property-mgmt", label: "PROPERTY MGMT", tabs: [{ id: "pm-dashboard",        label: "Dashboard" }] },
];

/* ─── Constants ─── */
const COMMUNITIES = ["Sunshine Ridge", "Palm Coast Estates", "Emerald Bay", "Coral Springs Village", "Magnolia Park", "Cypress Landing", "Lake Nona Shores", "Riverview Heights"] as const;
const CITIES = ["Orlando", "Tampa", "Jacksonville", "Lakeland"] as const;
const ENTITIES = ["Sunshine Homes LLC", "Sunshine Homes East LLC"] as const;
const PLANS = ["Avalon 1983", "Harmon 2100", "Seville 2306", "Meridian 2450", "Catalina 1750"] as const;
const SUPERS = ["Mike Torres", "Sarah Chen", "David Brooks", "Lisa Nguyen", "James Wilson", "Maria Santos"] as const;
const STAGES = ["Permit", "Foundation", "Framing", "MEP / Drywall", "Finishes", "Closing"] as const;
const LENDERS = ["First National Bank", "SunTrust Builders", "Capital One CRE", "Regions Construction", "TD Bank"] as const;

/* Community → city/entity mapping */
const COMM_META: Record<string, { city: string; entity: string }> = {
  "Sunshine Ridge":         { city: "Orlando",      entity: "Sunshine Homes LLC" },
  "Palm Coast Estates":     { city: "Jacksonville", entity: "Sunshine Homes East LLC" },
  "Emerald Bay":            { city: "Tampa",        entity: "Sunshine Homes LLC" },
  "Coral Springs Village":  { city: "Orlando",      entity: "Sunshine Homes LLC" },
  "Magnolia Park":          { city: "Tampa",        entity: "Sunshine Homes East LLC" },
  "Cypress Landing":        { city: "Jacksonville", entity: "Sunshine Homes East LLC" },
  "Lake Nona Shores":       { city: "Orlando",      entity: "Sunshine Homes LLC" },
  "Riverview Heights":      { city: "Lakeland",     entity: "Sunshine Homes East LLC" },
};

/* ─── Jobs (60 total) ─── */
export const jobs: SHJob[] = [
  /* ── Sunshine Ridge – Orlando (8 jobs) ── */
  { id:1,  jobCode:"SH-1001", lot:"Lot 14",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",   superintendent:"Mike Torres",   stage:"Finishes",       completionPct:88, startDate:"2025-06-10", estCompletion:"2026-04-15", contractValue:485000, estimatedCost:362000, actualCostToDate:318000, wipBalance:318000, lotCost:52000, originalBudget:370000, projectedFinalCost:368000, margin:117000, marginPct:24.1, daysInCurrentPhase:18, totalCycleDays:280, permitDate:"2025-06-20", foundationDate:"2025-07-25", framingDate:"2025-09-10", mepDate:"2025-11-05", drywallDate:"2025-12-20", finishesDate:"2026-02-15", coDate:null, closingDate:null },
  { id:2,  jobCode:"SH-1002", lot:"Lot 15",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",   superintendent:"Mike Torres",   stage:"MEP / Drywall", completionPct:62, startDate:"2025-08-20", estCompletion:"2026-06-10", contractValue:520000, estimatedCost:388000, actualCostToDate:240000, wipBalance:240000, lotCost:52000, originalBudget:395000, projectedFinalCost:392000, margin:128000, marginPct:24.6, daysInCurrentPhase:32, totalCycleDays:210, permitDate:"2025-09-01", foundationDate:"2025-10-05", framingDate:"2025-11-20", mepDate:"2026-01-15", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:3,  jobCode:"SH-1003", lot:"Lot 22",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"Sarah Chen",    stage:"Framing",        completionPct:35, startDate:"2025-11-01", estCompletion:"2026-08-20", contractValue:565000, estimatedCost:422000, actualCostToDate:148000, wipBalance:148000, lotCost:52000, originalBudget:430000, projectedFinalCost:428000, margin:137000, marginPct:24.2, daysInCurrentPhase:22, totalCycleDays:140, permitDate:"2025-11-15", foundationDate:"2025-12-20", framingDate:"2026-02-01", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:4,  jobCode:"SH-1004", lot:"Lot 23",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",   superintendent:"Sarah Chen",    stage:"Foundation",     completionPct:15, startDate:"2026-01-05", estCompletion:"2026-10-15", contractValue:490000, estimatedCost:365000, actualCostToDate:55000,  wipBalance:55000,  lotCost:52000, originalBudget:372000, projectedFinalCost:370000, margin:120000, marginPct:24.5, daysInCurrentPhase:14, totalCycleDays:78,  permitDate:"2026-01-18", foundationDate:"2026-02-20", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:5,  jobCode:"SH-1005", lot:"Lot 30",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",   superintendent:"Mike Torres",   stage:"Closing",        completionPct:98, startDate:"2025-03-15", estCompletion:"2026-03-28", contractValue:525000, estimatedCost:390000, actualCostToDate:388000, wipBalance:388000, lotCost:52000, originalBudget:398000, projectedFinalCost:393000, margin:132000, marginPct:25.1, daysInCurrentPhase:8,  totalCycleDays:365, permitDate:"2025-03-28", foundationDate:"2025-05-10", framingDate:"2025-07-05", mepDate:"2025-09-01", drywallDate:"2025-10-20", finishesDate:"2025-12-15", coDate:"2026-03-10", closingDate:null },
  { id:6,  jobCode:"SH-1006", lot:"Lot 31",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"Mike Torres",   stage:"Permit",         completionPct:5,  startDate:"2026-02-20", estCompletion:"2026-12-01", contractValue:570000, estimatedCost:425000, actualCostToDate:12000,  wipBalance:12000,  lotCost:52000, originalBudget:432000, projectedFinalCost:430000, margin:140000, marginPct:24.6, daysInCurrentPhase:32, totalCycleDays:32,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:31, jobCode:"SH-1007", lot:"Lot 32",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Meridian 2450", superintendent:"James Wilson",  stage:"Foundation",     completionPct:12, startDate:"2026-01-15", estCompletion:"2026-11-05", contractValue:608000, estimatedCost:454000, actualCostToDate:54000,  wipBalance:54000,  lotCost:52000, originalBudget:460000, projectedFinalCost:458000, margin:150000, marginPct:24.7, daysInCurrentPhase:10, totalCycleDays:68,  permitDate:"2026-01-28", foundationDate:"2026-03-05", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:32, jobCode:"SH-1008", lot:"Lot 33",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Catalina 1750", superintendent:"James Wilson",  stage:"Permit",         completionPct:3,  startDate:"2026-03-05", estCompletion:"2026-12-20", contractValue:425000, estimatedCost:317000, actualCostToDate:8000,   wipBalance:8000,   lotCost:52000, originalBudget:324000, projectedFinalCost:320000, margin:105000, marginPct:24.7, daysInCurrentPhase:19, totalCycleDays:19,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* ── Palm Coast Estates – Jacksonville (8 jobs) ── */
  { id:7,  jobCode:"SH-2001", lot:"Lot 3",   community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"David Brooks",  stage:"MEP / Drywall", completionPct:58, startDate:"2025-09-01", estCompletion:"2026-06-20", contractValue:445000, estimatedCost:332000, actualCostToDate:192000, wipBalance:192000, lotCost:38000, originalBudget:340000, projectedFinalCost:338000, margin:107000, marginPct:24.0, daysInCurrentPhase:28, totalCycleDays:200, permitDate:"2025-09-12", foundationDate:"2025-10-18", framingDate:"2025-12-02", mepDate:"2026-01-20", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:8,  jobCode:"SH-2002", lot:"Lot 4",   community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Avalon 1983",   superintendent:"David Brooks",  stage:"Framing",        completionPct:32, startDate:"2025-11-10", estCompletion:"2026-08-28", contractValue:410000, estimatedCost:306000, actualCostToDate:98000,  wipBalance:98000,  lotCost:38000, originalBudget:312000, projectedFinalCost:310000, margin:100000, marginPct:24.4, daysInCurrentPhase:18, totalCycleDays:134, permitDate:"2025-11-22", foundationDate:"2026-01-05", framingDate:"2026-02-10", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:9,  jobCode:"SH-2003", lot:"Lot 8",   community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Seville 2306",  superintendent:"Lisa Nguyen",   stage:"Finishes",       completionPct:82, startDate:"2025-07-05", estCompletion:"2026-04-25", contractValue:498000, estimatedCost:372000, actualCostToDate:305000, wipBalance:305000, lotCost:38000, originalBudget:380000, projectedFinalCost:376000, margin:122000, marginPct:24.5, daysInCurrentPhase:25, totalCycleDays:258, permitDate:"2025-07-18", foundationDate:"2025-08-22", framingDate:"2025-10-10", mepDate:"2025-12-05", drywallDate:"2026-01-15", finishesDate:"2026-02-20", coDate:null, closingDate:null },
  { id:10, jobCode:"SH-2004", lot:"Lot 11",  community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"David Brooks",  stage:"Foundation",     completionPct:12, startDate:"2026-01-15", estCompletion:"2026-10-28", contractValue:450000, estimatedCost:336000, actualCostToDate:40000,  wipBalance:40000,  lotCost:38000, originalBudget:342000, projectedFinalCost:340000, margin:110000, marginPct:24.4, daysInCurrentPhase:10, totalCycleDays:68,  permitDate:"2026-01-28", foundationDate:"2026-03-01", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:11, jobCode:"SH-2005", lot:"Lot 12",  community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Avalon 1983",   superintendent:"Lisa Nguyen",   stage:"Closing",        completionPct:96, startDate:"2025-04-20", estCompletion:"2026-03-30", contractValue:415000, estimatedCost:310000, actualCostToDate:308000, wipBalance:308000, lotCost:38000, originalBudget:316000, projectedFinalCost:312000, margin:103000, marginPct:24.8, daysInCurrentPhase:5,  totalCycleDays:335, permitDate:"2025-05-02", foundationDate:"2025-06-15", framingDate:"2025-08-10", mepDate:"2025-10-05", drywallDate:"2025-11-18", finishesDate:"2026-01-10", coDate:"2026-03-15", closingDate:null },
  { id:33, jobCode:"SH-2006", lot:"Lot 13",  community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Meridian 2450", superintendent:"Lisa Nguyen",   stage:"Framing",        completionPct:30, startDate:"2025-11-25", estCompletion:"2026-09-10", contractValue:528000, estimatedCost:394000, actualCostToDate:118000, wipBalance:118000, lotCost:38000, originalBudget:400000, projectedFinalCost:398000, margin:130000, marginPct:24.6, daysInCurrentPhase:16, totalCycleDays:119, permitDate:"2025-12-08", foundationDate:"2026-01-12", framingDate:"2026-02-18", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:34, jobCode:"SH-2007", lot:"Lot 15",  community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Catalina 1750", superintendent:"David Brooks",  stage:"Permit",         completionPct:4,  startDate:"2026-03-01", estCompletion:"2026-12-10", contractValue:392000, estimatedCost:292000, actualCostToDate:9000,   wipBalance:9000,   lotCost:38000, originalBudget:298000, projectedFinalCost:296000, margin:96000,  marginPct:24.5, daysInCurrentPhase:23, totalCycleDays:23,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:35, jobCode:"SH-2008", lot:"Lot 16",  community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Seville 2306",  superintendent:"Maria Santos",  stage:"MEP / Drywall", completionPct:55, startDate:"2025-09-15", estCompletion:"2026-07-01", contractValue:502000, estimatedCost:374000, actualCostToDate:206000, wipBalance:206000, lotCost:38000, originalBudget:382000, projectedFinalCost:378000, margin:124000, marginPct:24.7, daysInCurrentPhase:26, totalCycleDays:190, permitDate:"2025-09-28", foundationDate:"2025-11-02", framingDate:"2025-12-18", mepDate:"2026-02-05", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* ── Emerald Bay – Tampa (8 jobs) ── */
  { id:12, jobCode:"SH-3001", lot:"Lot 7",   community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"Sarah Chen",    stage:"Framing",        completionPct:38, startDate:"2025-10-15", estCompletion:"2026-08-05", contractValue:545000, estimatedCost:407000, actualCostToDate:155000, wipBalance:155000, lotCost:48000, originalBudget:415000, projectedFinalCost:412000, margin:133000, marginPct:24.4, daysInCurrentPhase:20, totalCycleDays:160, permitDate:"2025-10-28", foundationDate:"2025-12-05", framingDate:"2026-01-18", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:13, jobCode:"SH-3002", lot:"Lot 9",   community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Avalon 1983",   superintendent:"Sarah Chen",    stage:"Finishes",       completionPct:85, startDate:"2025-06-25", estCompletion:"2026-04-20", contractValue:475000, estimatedCost:355000, actualCostToDate:302000, wipBalance:302000, lotCost:48000, originalBudget:362000, projectedFinalCost:358000, margin:117000, marginPct:24.6, daysInCurrentPhase:22, totalCycleDays:268, permitDate:"2025-07-08", foundationDate:"2025-08-15", framingDate:"2025-10-01", mepDate:"2025-11-28", drywallDate:"2026-01-10", finishesDate:"2026-02-18", coDate:null, closingDate:null },
  { id:14, jobCode:"SH-3003", lot:"Lot 16",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Harmon 2100",   superintendent:"Mike Torres",   stage:"MEP / Drywall", completionPct:55, startDate:"2025-09-10", estCompletion:"2026-06-28", contractValue:510000, estimatedCost:380000, actualCostToDate:209000, wipBalance:209000, lotCost:48000, originalBudget:388000, projectedFinalCost:385000, margin:125000, marginPct:24.5, daysInCurrentPhase:30, totalCycleDays:195, permitDate:"2025-09-22", foundationDate:"2025-10-28", framingDate:"2025-12-15", mepDate:"2026-02-01", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:15, jobCode:"SH-3004", lot:"Lot 20",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"Sarah Chen",    stage:"Permit",         completionPct:3,  startDate:"2026-03-01", estCompletion:"2026-12-15", contractValue:550000, estimatedCost:410000, actualCostToDate:8000,   wipBalance:8000,   lotCost:48000, originalBudget:418000, projectedFinalCost:415000, margin:135000, marginPct:24.5, daysInCurrentPhase:23, totalCycleDays:23,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:16, jobCode:"SH-3005", lot:"Lot 21",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Avalon 1983",   superintendent:"Mike Torres",   stage:"Foundation",     completionPct:18, startDate:"2025-12-20", estCompletion:"2026-09-30", contractValue:480000, estimatedCost:358000, actualCostToDate:64000,  wipBalance:64000,  lotCost:48000, originalBudget:365000, projectedFinalCost:362000, margin:118000, marginPct:24.6, daysInCurrentPhase:12, totalCycleDays:94,  permitDate:"2026-01-05", foundationDate:"2026-02-10", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:36, jobCode:"SH-3006", lot:"Lot 24",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Meridian 2450", superintendent:"Maria Santos",  stage:"Closing",        completionPct:97, startDate:"2025-04-10", estCompletion:"2026-03-25", contractValue:615000, estimatedCost:459000, actualCostToDate:456000, wipBalance:456000, lotCost:48000, originalBudget:465000, projectedFinalCost:461000, margin:154000, marginPct:25.0, daysInCurrentPhase:7,  totalCycleDays:345, permitDate:"2025-04-22", foundationDate:"2025-06-05", framingDate:"2025-08-01", mepDate:"2025-09-28", drywallDate:"2025-11-12", finishesDate:"2026-01-08", coDate:"2026-03-12", closingDate:null },
  { id:37, jobCode:"SH-3007", lot:"Lot 25",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Catalina 1750", superintendent:"Sarah Chen",    stage:"MEP / Drywall", completionPct:50, startDate:"2025-09-25", estCompletion:"2026-07-10", contractValue:438000, estimatedCost:327000, actualCostToDate:164000, wipBalance:164000, lotCost:48000, originalBudget:334000, projectedFinalCost:330000, margin:108000, marginPct:24.7, daysInCurrentPhase:20, totalCycleDays:180, permitDate:"2025-10-08", foundationDate:"2025-11-12", framingDate:"2025-12-28", mepDate:"2026-02-12", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:38, jobCode:"SH-3008", lot:"Lot 26",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Harmon 2100",   superintendent:"Maria Santos",  stage:"Framing",        completionPct:33, startDate:"2025-11-18", estCompletion:"2026-08-28", contractValue:518000, estimatedCost:386000, actualCostToDate:127000, wipBalance:127000, lotCost:48000, originalBudget:394000, projectedFinalCost:390000, margin:128000, marginPct:24.7, daysInCurrentPhase:17, totalCycleDays:126, permitDate:"2025-12-01", foundationDate:"2026-01-08", framingDate:"2026-02-15", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* ── Coral Springs Village – Orlando (8 jobs) ── */
  { id:17, jobCode:"SH-4001", lot:"Lot 2",   community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",   superintendent:"Lisa Nguyen",   stage:"Closing",        completionPct:97, startDate:"2025-04-01", estCompletion:"2026-03-25", contractValue:505000, estimatedCost:376000, actualCostToDate:374000, wipBalance:374000, lotCost:45000, originalBudget:382000, projectedFinalCost:378000, margin:127000, marginPct:25.1, daysInCurrentPhase:6,  totalCycleDays:355, permitDate:"2025-04-14", foundationDate:"2025-05-28", framingDate:"2025-07-22", mepDate:"2025-09-18", drywallDate:"2025-11-02", finishesDate:"2026-01-05", coDate:"2026-03-08", closingDate:null },
  { id:18, jobCode:"SH-4002", lot:"Lot 5",   community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"Lisa Nguyen",   stage:"Finishes",       completionPct:80, startDate:"2025-07-15", estCompletion:"2026-05-05", contractValue:555000, estimatedCost:414000, actualCostToDate:331000, wipBalance:331000, lotCost:45000, originalBudget:422000, projectedFinalCost:418000, margin:137000, marginPct:24.7, daysInCurrentPhase:20, totalCycleDays:250, permitDate:"2025-07-28", foundationDate:"2025-09-02", framingDate:"2025-10-20", mepDate:"2025-12-15", drywallDate:"2026-01-28", finishesDate:"2026-03-01", coDate:null, closingDate:null },
  { id:19, jobCode:"SH-4003", lot:"Lot 10",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",   superintendent:"David Brooks",  stage:"MEP / Drywall", completionPct:60, startDate:"2025-08-28", estCompletion:"2026-06-15", contractValue:478000, estimatedCost:356000, actualCostToDate:214000, wipBalance:214000, lotCost:45000, originalBudget:364000, projectedFinalCost:360000, margin:118000, marginPct:24.7, daysInCurrentPhase:26, totalCycleDays:205, permitDate:"2025-09-10", foundationDate:"2025-10-15", framingDate:"2025-12-01", mepDate:"2026-01-22", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:20, jobCode:"SH-4004", lot:"Lot 17",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",   superintendent:"David Brooks",  stage:"Framing",        completionPct:30, startDate:"2025-11-20", estCompletion:"2026-09-05", contractValue:508000, estimatedCost:378000, actualCostToDate:113000, wipBalance:113000, lotCost:45000, originalBudget:386000, projectedFinalCost:382000, margin:126000, marginPct:24.8, daysInCurrentPhase:15, totalCycleDays:124, permitDate:"2025-12-05", foundationDate:"2026-01-10", framingDate:"2026-02-15", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:21, jobCode:"SH-4005", lot:"Lot 18",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"Lisa Nguyen",   stage:"Permit",         completionPct:4,  startDate:"2026-02-25", estCompletion:"2026-12-10", contractValue:560000, estimatedCost:418000, actualCostToDate:10000,  wipBalance:10000,  lotCost:45000, originalBudget:426000, projectedFinalCost:422000, margin:138000, marginPct:24.6, daysInCurrentPhase:27, totalCycleDays:27,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:39, jobCode:"SH-4006", lot:"Lot 19",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Meridian 2450", superintendent:"James Wilson",  stage:"Finishes",       completionPct:76, startDate:"2025-07-28", estCompletion:"2026-05-15", contractValue:595000, estimatedCost:444000, actualCostToDate:338000, wipBalance:338000, lotCost:45000, originalBudget:450000, projectedFinalCost:448000, margin:147000, marginPct:24.7, daysInCurrentPhase:14, totalCycleDays:238, permitDate:"2025-08-10", foundationDate:"2025-09-15", framingDate:"2025-11-02", mepDate:"2025-12-28", drywallDate:"2026-02-08", finishesDate:"2026-03-08", coDate:null, closingDate:null },
  { id:40, jobCode:"SH-4007", lot:"Lot 20",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Catalina 1750", superintendent:"James Wilson",  stage:"Foundation",     completionPct:10, startDate:"2026-01-20", estCompletion:"2026-10-25", contractValue:418000, estimatedCost:312000, actualCostToDate:31000,  wipBalance:31000,  lotCost:45000, originalBudget:318000, projectedFinalCost:316000, margin:102000, marginPct:24.4, daysInCurrentPhase:8,  totalCycleDays:63,  permitDate:"2026-02-01", foundationDate:"2026-03-08", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:41, jobCode:"SH-4008", lot:"Lot 21",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",   superintendent:"Lisa Nguyen",   stage:"MEP / Drywall", completionPct:53, startDate:"2025-09-20", estCompletion:"2026-07-08", contractValue:482000, estimatedCost:360000, actualCostToDate:191000, wipBalance:191000, lotCost:45000, originalBudget:366000, projectedFinalCost:364000, margin:118000, marginPct:24.5, daysInCurrentPhase:22, totalCycleDays:185, permitDate:"2025-10-03", foundationDate:"2025-11-08", framingDate:"2025-12-22", mepDate:"2026-02-10", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* ── Magnolia Park – Tampa (8 jobs) ── */
  { id:22, jobCode:"SH-5001", lot:"Lot 1",   community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Avalon 1983",   superintendent:"Mike Torres",   stage:"Closing",        completionPct:99, startDate:"2025-03-01", estCompletion:"2026-03-20", contractValue:462000, estimatedCost:345000, actualCostToDate:343000, wipBalance:343000, lotCost:42000, originalBudget:352000, projectedFinalCost:348000, margin:114000, marginPct:24.7, daysInCurrentPhase:4,  totalCycleDays:380, permitDate:"2025-03-14", foundationDate:"2025-04-28", framingDate:"2025-06-22", mepDate:"2025-08-18", drywallDate:"2025-10-01", finishesDate:"2025-12-02", coDate:"2026-03-05", closingDate:null },
  { id:23, jobCode:"SH-5002", lot:"Lot 6",   community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"Sarah Chen",    stage:"Finishes",       completionPct:78, startDate:"2025-07-20", estCompletion:"2026-05-10", contractValue:498000, estimatedCost:372000, actualCostToDate:290000, wipBalance:290000, lotCost:42000, originalBudget:380000, projectedFinalCost:376000, margin:122000, marginPct:24.5, daysInCurrentPhase:16, totalCycleDays:245, permitDate:"2025-08-02", foundationDate:"2025-09-08", framingDate:"2025-10-25", mepDate:"2025-12-20", drywallDate:"2026-02-01", finishesDate:"2026-03-05", coDate:null, closingDate:null },
  { id:24, jobCode:"SH-5003", lot:"Lot 13",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Seville 2306",  superintendent:"Sarah Chen",    stage:"Framing",        completionPct:33, startDate:"2025-11-05", estCompletion:"2026-08-15", contractValue:535000, estimatedCost:399000, actualCostToDate:132000, wipBalance:132000, lotCost:42000, originalBudget:406000, projectedFinalCost:404000, margin:131000, marginPct:24.5, daysInCurrentPhase:19, totalCycleDays:139, permitDate:"2025-11-18", foundationDate:"2025-12-22", framingDate:"2026-02-05", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:25, jobCode:"SH-5004", lot:"Lot 19",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Avalon 1983",   superintendent:"Mike Torres",   stage:"Foundation",     completionPct:14, startDate:"2026-01-10", estCompletion:"2026-10-20", contractValue:468000, estimatedCost:349000, actualCostToDate:49000,  wipBalance:49000,  lotCost:42000, originalBudget:356000, projectedFinalCost:353000, margin:115000, marginPct:24.6, daysInCurrentPhase:11, totalCycleDays:73,  permitDate:"2026-01-22", foundationDate:"2026-02-25", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:26, jobCode:"SH-5005", lot:"Lot 24",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"Sarah Chen",    stage:"MEP / Drywall", completionPct:52, startDate:"2025-09-18", estCompletion:"2026-07-05", contractValue:502000, estimatedCost:374000, actualCostToDate:195000, wipBalance:195000, lotCost:42000, originalBudget:382000, projectedFinalCost:378000, margin:124000, marginPct:24.7, daysInCurrentPhase:24, totalCycleDays:188, permitDate:"2025-10-01", foundationDate:"2025-11-05", framingDate:"2025-12-20", mepDate:"2026-02-08", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:42, jobCode:"SH-5006", lot:"Lot 25",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Meridian 2450", superintendent:"Maria Santos",  stage:"Framing",        completionPct:28, startDate:"2025-12-01", estCompletion:"2026-09-15", contractValue:588000, estimatedCost:439000, actualCostToDate:123000, wipBalance:123000, lotCost:42000, originalBudget:446000, projectedFinalCost:442000, margin:146000, marginPct:24.8, daysInCurrentPhase:14, totalCycleDays:113, permitDate:"2025-12-14", foundationDate:"2026-01-20", framingDate:"2026-03-02", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:43, jobCode:"SH-5007", lot:"Lot 26",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Catalina 1750", superintendent:"Mike Torres",   stage:"Permit",         completionPct:5,  startDate:"2026-02-28", estCompletion:"2026-12-08", contractValue:415000, estimatedCost:310000, actualCostToDate:9000,   wipBalance:9000,   lotCost:42000, originalBudget:316000, projectedFinalCost:314000, margin:101000, marginPct:24.3, daysInCurrentPhase:24, totalCycleDays:24,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:44, jobCode:"SH-5008", lot:"Lot 27",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Seville 2306",  superintendent:"Maria Santos",  stage:"Finishes",       completionPct:75, startDate:"2025-08-05", estCompletion:"2026-05-20", contractValue:540000, estimatedCost:403000, actualCostToDate:302000, wipBalance:302000, lotCost:42000, originalBudget:410000, projectedFinalCost:406000, margin:134000, marginPct:24.8, daysInCurrentPhase:12, totalCycleDays:230, permitDate:"2025-08-18", foundationDate:"2025-09-22", framingDate:"2025-11-08", mepDate:"2026-01-05", drywallDate:"2026-02-15", finishesDate:"2026-03-10", coDate:null, closingDate:null },

  /* ── Cypress Landing – Jacksonville (7 jobs) ── */
  { id:27, jobCode:"SH-6001", lot:"Lot 25",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Seville 2306",  superintendent:"David Brooks",  stage:"MEP / Drywall", completionPct:56, startDate:"2025-09-05", estCompletion:"2026-06-25", contractValue:542000, estimatedCost:404000, actualCostToDate:226000, wipBalance:226000, lotCost:40000, originalBudget:412000, projectedFinalCost:408000, margin:134000, marginPct:24.7, daysInCurrentPhase:29, totalCycleDays:198, permitDate:"2025-09-18", foundationDate:"2025-10-22", framingDate:"2025-12-08", mepDate:"2026-01-25", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:28, jobCode:"SH-6002", lot:"Lot 26",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Avalon 1983",   superintendent:"Lisa Nguyen",   stage:"Framing",        completionPct:28, startDate:"2025-12-01", estCompletion:"2026-09-12", contractValue:458000, estimatedCost:342000, actualCostToDate:96000,  wipBalance:96000,  lotCost:40000, originalBudget:348000, projectedFinalCost:346000, margin:112000, marginPct:24.5, daysInCurrentPhase:16, totalCycleDays:113, permitDate:"2025-12-14", foundationDate:"2026-01-18", framingDate:"2026-03-01", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:29, jobCode:"SH-6003", lot:"Lot 27",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"David Brooks",  stage:"Permit",         completionPct:6,  startDate:"2026-02-15", estCompletion:"2026-11-25", contractValue:465000, estimatedCost:347000, actualCostToDate:14000,  wipBalance:14000,  lotCost:40000, originalBudget:354000, projectedFinalCost:350000, margin:115000, marginPct:24.7, daysInCurrentPhase:37, totalCycleDays:37,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:30, jobCode:"SH-6004", lot:"Lot 28",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Seville 2306",  superintendent:"Lisa Nguyen",   stage:"Foundation",     completionPct:10, startDate:"2026-01-20", estCompletion:"2026-10-30", contractValue:548000, estimatedCost:408000, actualCostToDate:41000,  wipBalance:41000,  lotCost:40000, originalBudget:416000, projectedFinalCost:412000, margin:136000, marginPct:24.8, daysInCurrentPhase:8,  totalCycleDays:63,  permitDate:"2026-02-02", foundationDate:"2026-03-08", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:45, jobCode:"SH-6005", lot:"Lot 29",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Meridian 2450", superintendent:"James Wilson",  stage:"Closing",        completionPct:96, startDate:"2025-04-15", estCompletion:"2026-03-28", contractValue:582000, estimatedCost:434000, actualCostToDate:432000, wipBalance:432000, lotCost:40000, originalBudget:440000, projectedFinalCost:436000, margin:146000, marginPct:25.1, daysInCurrentPhase:6,  totalCycleDays:340, permitDate:"2025-04-28", foundationDate:"2025-06-10", framingDate:"2025-08-05", mepDate:"2025-10-01", drywallDate:"2025-11-15", finishesDate:"2026-01-12", coDate:"2026-03-10", closingDate:null },
  { id:46, jobCode:"SH-6006", lot:"Lot 30",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Catalina 1750", superintendent:"David Brooks",  stage:"Finishes",       completionPct:79, startDate:"2025-07-28", estCompletion:"2026-05-10", contractValue:425000, estimatedCost:317000, actualCostToDate:250000, wipBalance:250000, lotCost:40000, originalBudget:324000, projectedFinalCost:320000, margin:105000, marginPct:24.7, daysInCurrentPhase:15, totalCycleDays:238, permitDate:"2025-08-10", foundationDate:"2025-09-15", framingDate:"2025-11-01", mepDate:"2025-12-28", drywallDate:"2026-02-05", finishesDate:"2026-03-08", coDate:null, closingDate:null },
  { id:47, jobCode:"SH-6007", lot:"Lot 31",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"Maria Santos",  stage:"MEP / Drywall", completionPct:48, startDate:"2025-10-01", estCompletion:"2026-07-15", contractValue:470000, estimatedCost:351000, actualCostToDate:168000, wipBalance:168000, lotCost:40000, originalBudget:358000, projectedFinalCost:354000, margin:116000, marginPct:24.7, daysInCurrentPhase:18, totalCycleDays:174, permitDate:"2025-10-14", foundationDate:"2025-11-18", framingDate:"2026-01-05", mepDate:"2026-02-20", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* ── Lake Nona Shores – Orlando (7 jobs) ── */
  { id:48, jobCode:"SH-7001", lot:"Lot 1",   community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Meridian 2450", superintendent:"James Wilson",  stage:"Finishes",       completionPct:90, startDate:"2025-06-01", estCompletion:"2026-04-10", contractValue:618000, estimatedCost:461000, actualCostToDate:415000, wipBalance:415000, lotCost:60000, originalBudget:468000, projectedFinalCost:465000, margin:153000, marginPct:24.8, daysInCurrentPhase:20, totalCycleDays:292, permitDate:"2025-06-14", foundationDate:"2025-07-20", framingDate:"2025-09-05", mepDate:"2025-11-01", drywallDate:"2025-12-15", finishesDate:"2026-02-10", coDate:null, closingDate:null },
  { id:49, jobCode:"SH-7002", lot:"Lot 2",   community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"James Wilson",  stage:"Closing",        completionPct:98, startDate:"2025-03-20", estCompletion:"2026-03-25", contractValue:572000, estimatedCost:426000, actualCostToDate:424000, wipBalance:424000, lotCost:60000, originalBudget:434000, projectedFinalCost:430000, margin:142000, marginPct:24.8, daysInCurrentPhase:7,  totalCycleDays:368, permitDate:"2025-04-02", foundationDate:"2025-05-15", framingDate:"2025-07-10", mepDate:"2025-09-05", drywallDate:"2025-10-20", finishesDate:"2025-12-18", coDate:"2026-03-10", closingDate:null },
  { id:50, jobCode:"SH-7003", lot:"Lot 3",   community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",   superintendent:"Sarah Chen",    stage:"MEP / Drywall", completionPct:58, startDate:"2025-08-25", estCompletion:"2026-06-15", contractValue:528000, estimatedCost:394000, actualCostToDate:228000, wipBalance:228000, lotCost:60000, originalBudget:402000, projectedFinalCost:398000, margin:130000, marginPct:24.6, daysInCurrentPhase:25, totalCycleDays:210, permitDate:"2025-09-08", foundationDate:"2025-10-12", framingDate:"2025-11-28", mepDate:"2026-01-18", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:51, jobCode:"SH-7004", lot:"Lot 5",   community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",   superintendent:"Mike Torres",   stage:"Framing",        completionPct:36, startDate:"2025-10-28", estCompletion:"2026-08-12", contractValue:492000, estimatedCost:367000, actualCostToDate:132000, wipBalance:132000, lotCost:60000, originalBudget:374000, projectedFinalCost:372000, margin:120000, marginPct:24.4, daysInCurrentPhase:18, totalCycleDays:147, permitDate:"2025-11-10", foundationDate:"2025-12-15", framingDate:"2026-01-28", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:52, jobCode:"SH-7005", lot:"Lot 7",   community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Catalina 1750", superintendent:"Sarah Chen",    stage:"Foundation",     completionPct:13, startDate:"2026-01-08", estCompletion:"2026-10-18", contractValue:435000, estimatedCost:325000, actualCostToDate:42000,  wipBalance:42000,  lotCost:60000, originalBudget:332000, projectedFinalCost:328000, margin:107000, marginPct:24.6, daysInCurrentPhase:12, totalCycleDays:75,  permitDate:"2026-01-20", foundationDate:"2026-02-24", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:53, jobCode:"SH-7006", lot:"Lot 8",   community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Meridian 2450", superintendent:"James Wilson",  stage:"Permit",         completionPct:5,  startDate:"2026-02-18", estCompletion:"2026-12-05", contractValue:622000, estimatedCost:464000, actualCostToDate:14000,  wipBalance:14000,  lotCost:60000, originalBudget:472000, projectedFinalCost:468000, margin:154000, marginPct:24.8, daysInCurrentPhase:34, totalCycleDays:34,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:54, jobCode:"SH-7007", lot:"Lot 10",  community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306",  superintendent:"Mike Torres",   stage:"Framing",        completionPct:31, startDate:"2025-11-12", estCompletion:"2026-08-25", contractValue:568000, estimatedCost:424000, actualCostToDate:131000, wipBalance:131000, lotCost:60000, originalBudget:430000, projectedFinalCost:428000, margin:140000, marginPct:24.6, daysInCurrentPhase:15, totalCycleDays:132, permitDate:"2025-11-25", foundationDate:"2026-01-02", framingDate:"2026-02-08", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* ── Riverview Heights – Lakeland (6 jobs) ── */
  { id:58, jobCode:"SH-8001", lot:"Lot 1",   community:"Riverview Heights",    city:"Lakeland",     entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"Maria Santos",  stage:"Framing",        completionPct:34, startDate:"2025-10-20", estCompletion:"2026-08-08", contractValue:465000, estimatedCost:347000, actualCostToDate:118000, wipBalance:118000, lotCost:35000, originalBudget:354000, projectedFinalCost:350000, margin:115000, marginPct:24.7, daysInCurrentPhase:16, totalCycleDays:155, permitDate:"2025-11-02", foundationDate:"2025-12-08", framingDate:"2026-01-22", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:59, jobCode:"SH-8002", lot:"Lot 3",   community:"Riverview Heights",    city:"Lakeland",     entity:"Sunshine Homes East LLC", plan:"Avalon 1983",   superintendent:"Maria Santos",  stage:"MEP / Drywall", completionPct:55, startDate:"2025-09-08", estCompletion:"2026-06-25", contractValue:440000, estimatedCost:328000, actualCostToDate:180000, wipBalance:180000, lotCost:35000, originalBudget:336000, projectedFinalCost:332000, margin:108000, marginPct:24.5, daysInCurrentPhase:22, totalCycleDays:197, permitDate:"2025-09-20", foundationDate:"2025-10-25", framingDate:"2025-12-10", mepDate:"2026-01-28", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:60, jobCode:"SH-8003", lot:"Lot 5",   community:"Riverview Heights",    city:"Lakeland",     entity:"Sunshine Homes East LLC", plan:"Seville 2306",  superintendent:"James Wilson",  stage:"Finishes",       completionPct:83, startDate:"2025-06-28", estCompletion:"2026-04-18", contractValue:510000, estimatedCost:380000, actualCostToDate:316000, wipBalance:316000, lotCost:35000, originalBudget:388000, projectedFinalCost:384000, margin:126000, marginPct:24.7, daysInCurrentPhase:19, totalCycleDays:269, permitDate:"2025-07-11", foundationDate:"2025-08-18", framingDate:"2025-10-02", mepDate:"2025-11-28", drywallDate:"2026-01-10", finishesDate:"2026-02-22", coDate:null, closingDate:null },
  { id:61, jobCode:"SH-8004", lot:"Lot 7",   community:"Riverview Heights",    city:"Lakeland",     entity:"Sunshine Homes East LLC", plan:"Catalina 1750", superintendent:"Maria Santos",  stage:"Permit",         completionPct:4,  startDate:"2026-03-02", estCompletion:"2026-12-12", contractValue:388000, estimatedCost:290000, actualCostToDate:7000,   wipBalance:7000,   lotCost:35000, originalBudget:296000, projectedFinalCost:294000, margin:94000,  marginPct:24.2, daysInCurrentPhase:22, totalCycleDays:22,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:62, jobCode:"SH-8005", lot:"Lot 9",   community:"Riverview Heights",    city:"Lakeland",     entity:"Sunshine Homes East LLC", plan:"Meridian 2450", superintendent:"James Wilson",  stage:"Foundation",     completionPct:13, startDate:"2026-01-12", estCompletion:"2026-10-22", contractValue:555000, estimatedCost:414000, actualCostToDate:54000,  wipBalance:54000,  lotCost:35000, originalBudget:420000, projectedFinalCost:418000, margin:137000, marginPct:24.7, daysInCurrentPhase:10, totalCycleDays:71,  permitDate:"2026-01-25", foundationDate:"2026-03-01", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:63, jobCode:"SH-8006", lot:"Lot 11",  community:"Riverview Heights",    city:"Lakeland",     entity:"Sunshine Homes East LLC", plan:"Harmon 2100",   superintendent:"Maria Santos",  stage:"Closing",        completionPct:97, startDate:"2025-04-05", estCompletion:"2026-03-22", contractValue:470000, estimatedCost:351000, actualCostToDate:349000, wipBalance:349000, lotCost:35000, originalBudget:358000, projectedFinalCost:354000, margin:116000, marginPct:24.7, daysInCurrentPhase:5,  totalCycleDays:352, permitDate:"2025-04-18", foundationDate:"2025-06-01", framingDate:"2025-07-25", mepDate:"2025-09-20", drywallDate:"2025-11-05", finishesDate:"2026-01-05", coDate:"2026-03-10", closingDate:null },
];

/* ─── Sales (40 total) ─── */
export const sales: SHSale[] = [
  /* Sunshine Ridge */
  { id:1,  jobCode:"SH-1001", community:"Sunshine Ridge",       city:"Orlando",      plan:"Avalon 1983",   buyer:"Johnson Family",       salePrice:485000, contractDate:"2025-05-20", closingDate:null,         status:"active" },
  { id:2,  jobCode:"SH-1002", community:"Sunshine Ridge",       city:"Orlando",      plan:"Harmon 2100",   buyer:"Martinez Family",      salePrice:520000, contractDate:"2025-07-15", closingDate:null,         status:"active" },
  { id:3,  jobCode:"SH-1003", community:"Sunshine Ridge",       city:"Orlando",      plan:"Seville 2306",  buyer:"Williams Family",      salePrice:565000, contractDate:"2025-10-10", closingDate:null,         status:"active" },
  { id:4,  jobCode:"SH-1005", community:"Sunshine Ridge",       city:"Orlando",      plan:"Harmon 2100",   buyer:"Davis Family",         salePrice:525000, contractDate:"2025-02-28", closingDate:"2026-03-28", status:"pending" },
  { id:21, jobCode:"SH-1007", community:"Sunshine Ridge",       city:"Orlando",      plan:"Meridian 2450", buyer:"Hernandez Family",     salePrice:608000, contractDate:"2025-12-20", closingDate:null,         status:"active" },
  { id:22, jobCode:"SH-1008", community:"Sunshine Ridge",       city:"Orlando",      plan:"Catalina 1750", buyer:"Lopez Family",         salePrice:425000, contractDate:"2026-02-15", closingDate:null,         status:"active" },

  /* Palm Coast Estates */
  { id:5,  jobCode:"SH-2001", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Harmon 2100",   buyer:"Brown Family",         salePrice:445000, contractDate:"2025-08-12", closingDate:null,         status:"active" },
  { id:6,  jobCode:"SH-2003", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Seville 2306",  buyer:"Taylor Family",        salePrice:498000, contractDate:"2025-06-18", closingDate:null,         status:"active" },
  { id:7,  jobCode:"SH-2005", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Avalon 1983",   buyer:"Anderson Family",      salePrice:415000, contractDate:"2025-03-30", closingDate:"2026-03-30", status:"pending" },
  { id:23, jobCode:"SH-2006", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Meridian 2450", buyer:"Scott Family",         salePrice:528000, contractDate:"2025-11-05", closingDate:null,         status:"active" },
  { id:24, jobCode:"SH-2008", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Seville 2306",  buyer:"Ramirez Family",       salePrice:502000, contractDate:"2025-09-01", closingDate:null,         status:"active" },

  /* Emerald Bay */
  { id:8,  jobCode:"SH-3001", community:"Emerald Bay",          city:"Tampa",        plan:"Seville 2306",  buyer:"Thomas Family",        salePrice:545000, contractDate:"2025-09-25", closingDate:null,         status:"active" },
  { id:9,  jobCode:"SH-3002", community:"Emerald Bay",          city:"Tampa",        plan:"Avalon 1983",   buyer:"Jackson Family",       salePrice:475000, contractDate:"2025-06-05", closingDate:null,         status:"active" },
  { id:10, jobCode:"SH-3003", community:"Emerald Bay",          city:"Tampa",        plan:"Harmon 2100",   buyer:"White Family",         salePrice:510000, contractDate:"2025-08-20", closingDate:null,         status:"active" },
  { id:25, jobCode:"SH-3006", community:"Emerald Bay",          city:"Tampa",        plan:"Meridian 2450", buyer:"Moore Family",         salePrice:615000, contractDate:"2025-03-22", closingDate:"2026-03-25", status:"pending" },
  { id:26, jobCode:"SH-3007", community:"Emerald Bay",          city:"Tampa",        plan:"Catalina 1750", buyer:"Perez Family",         salePrice:438000, contractDate:"2025-09-10", closingDate:null,         status:"active" },

  /* Coral Springs Village */
  { id:11, jobCode:"SH-4001", community:"Coral Springs Village",city:"Orlando",      plan:"Harmon 2100",   buyer:"Harris Family",        salePrice:505000, contractDate:"2025-03-15", closingDate:"2026-03-25", status:"pending" },
  { id:12, jobCode:"SH-4002", community:"Coral Springs Village",city:"Orlando",      plan:"Seville 2306",  buyer:"Clark Family",         salePrice:555000, contractDate:"2025-06-28", closingDate:null,         status:"active" },
  { id:13, jobCode:"SH-4003", community:"Coral Springs Village",city:"Orlando",      plan:"Avalon 1983",   buyer:"Lewis Family",         salePrice:478000, contractDate:"2025-08-10", closingDate:null,         status:"active" },
  { id:27, jobCode:"SH-4006", community:"Coral Springs Village",city:"Orlando",      plan:"Meridian 2450", buyer:"Mitchell Family",      salePrice:595000, contractDate:"2025-07-05", closingDate:null,         status:"active" },
  { id:28, jobCode:"SH-4007", community:"Coral Springs Village",city:"Orlando",      plan:"Catalina 1750", buyer:"Nguyen Family",        salePrice:418000, contractDate:"2026-01-08", closingDate:null,         status:"active" },

  /* Magnolia Park */
  { id:14, jobCode:"SH-5001", community:"Magnolia Park",        city:"Tampa",        plan:"Avalon 1983",   buyer:"Robinson Family",      salePrice:462000, contractDate:"2025-02-15", closingDate:"2026-03-20", status:"pending" },
  { id:15, jobCode:"SH-5002", community:"Magnolia Park",        city:"Tampa",        plan:"Harmon 2100",   buyer:"Walker Family",        salePrice:498000, contractDate:"2025-07-02", closingDate:null,         status:"active" },
  { id:16, jobCode:"SH-5003", community:"Magnolia Park",        city:"Tampa",        plan:"Seville 2306",  buyer:"Young Family",         salePrice:535000, contractDate:"2025-10-18", closingDate:null,         status:"active" },
  { id:29, jobCode:"SH-5008", community:"Magnolia Park",        city:"Tampa",        plan:"Seville 2306",  buyer:"Torres Family",        salePrice:540000, contractDate:"2025-07-22", closingDate:null,         status:"active" },

  /* Cypress Landing */
  { id:17, jobCode:"SH-6001", community:"Cypress Landing",      city:"Jacksonville", plan:"Seville 2306",  buyer:"King Family",          salePrice:542000, contractDate:"2025-08-22", closingDate:null,         status:"active" },
  { id:18, jobCode:"SH-6002", community:"Cypress Landing",      city:"Jacksonville", plan:"Avalon 1983",   buyer:"Wright Family",        salePrice:458000, contractDate:"2025-11-15", closingDate:null,         status:"active" },
  { id:30, jobCode:"SH-6005", community:"Cypress Landing",      city:"Jacksonville", plan:"Meridian 2450", buyer:"Baker Family",         salePrice:582000, contractDate:"2025-04-01", closingDate:"2026-03-28", status:"pending" },
  { id:31, jobCode:"SH-6006", community:"Cypress Landing",      city:"Jacksonville", plan:"Catalina 1750", buyer:"Evans Family",         salePrice:425000, contractDate:"2025-07-15", closingDate:null,         status:"active" },

  /* Lake Nona Shores */
  { id:32, jobCode:"SH-7001", community:"Lake Nona Shores",     city:"Orlando",      plan:"Meridian 2450", buyer:"Collins Family",       salePrice:618000, contractDate:"2025-05-10", closingDate:null,         status:"active" },
  { id:33, jobCode:"SH-7002", community:"Lake Nona Shores",     city:"Orlando",      plan:"Seville 2306",  buyer:"Stewart Family",       salePrice:572000, contractDate:"2025-03-05", closingDate:"2026-03-25", status:"pending" },
  { id:34, jobCode:"SH-7003", community:"Lake Nona Shores",     city:"Orlando",      plan:"Harmon 2100",   buyer:"Murphy Family",        salePrice:528000, contractDate:"2025-08-10", closingDate:null,         status:"active" },
  { id:35, jobCode:"SH-7004", community:"Lake Nona Shores",     city:"Orlando",      plan:"Avalon 1983",   buyer:"Rivera Family",        salePrice:492000, contractDate:"2025-10-15", closingDate:null,         status:"active" },
  { id:36, jobCode:"SH-7007", community:"Lake Nona Shores",     city:"Orlando",      plan:"Avalon 1983",   buyer:"Parker Family",        salePrice:488000, contractDate:"2025-06-18", closingDate:null,         status:"active" },

  /* Riverview Heights */
  { id:37, jobCode:"SH-8001", community:"Riverview Heights",    city:"Lakeland",     plan:"Harmon 2100",   buyer:"Gonzalez Family",      salePrice:465000, contractDate:"2025-10-01", closingDate:null,         status:"active" },
  { id:38, jobCode:"SH-8003", community:"Riverview Heights",    city:"Lakeland",     plan:"Seville 2306",  buyer:"Carter Family",        salePrice:510000, contractDate:"2025-06-10", closingDate:null,         status:"active" },
  { id:39, jobCode:"SH-8006", community:"Riverview Heights",    city:"Lakeland",     plan:"Harmon 2100",   buyer:"Reed Family",          salePrice:470000, contractDate:"2025-03-20", closingDate:"2026-03-22", status:"pending" },

  /* Cancelled */
  { id:19, jobCode:"SH-X001", community:"Sunshine Ridge",       city:"Orlando",      plan:"Avalon 1983",   buyer:"Green Family",         salePrice:488000, contractDate:"2025-04-10", closingDate:null,         status:"cancelled" },
  { id:20, jobCode:"SH-X002", community:"Emerald Bay",          city:"Tampa",        plan:"Harmon 2100",   buyer:"Adams Family",         salePrice:515000, contractDate:"2025-09-05", closingDate:null,         status:"cancelled" },
  { id:40, jobCode:"SH-X003", community:"Lake Nona Shores",     city:"Orlando",      plan:"Meridian 2450", buyer:"Foster Family",        salePrice:620000, contractDate:"2025-11-20", closingDate:null,         status:"cancelled" },
];

/* ─── Loans (30 total) ─── */
export const loans: SHLoan[] = [
  /* Sunshine Ridge */
  { id:1,  jobCode:"SH-1001", community:"Sunshine Ridge",       city:"Orlando",      lender:"First National Bank",    loanAmount:340000, totalDrawn:295000, drawPct:86.8, interestRate:7.25, expirationDate:"2026-06-10", daysUntilExpiration:78  },
  { id:2,  jobCode:"SH-1002", community:"Sunshine Ridge",       city:"Orlando",      lender:"SunTrust Builders",      loanAmount:365000, totalDrawn:218000, drawPct:59.7, interestRate:7.50, expirationDate:"2026-08-20", daysUntilExpiration:149 },
  { id:3,  jobCode:"SH-1003", community:"Sunshine Ridge",       city:"Orlando",      lender:"Capital One CRE",        loanAmount:380000, totalDrawn:135000, drawPct:35.5, interestRate:7.00, expirationDate:"2026-11-01", daysUntilExpiration:222 },
  { id:17, jobCode:"SH-1007", community:"Sunshine Ridge",       city:"Orlando",      lender:"Regions Construction",   loanAmount:408000, totalDrawn:48000,  drawPct:11.8, interestRate:7.15, expirationDate:"2027-01-15", daysUntilExpiration:297 },

  /* Palm Coast Estates */
  { id:4,  jobCode:"SH-2001", community:"Palm Coast Estates",   city:"Jacksonville", lender:"Regions Construction",   loanAmount:295000, totalDrawn:175000, drawPct:59.3, interestRate:7.35, expirationDate:"2026-09-01", daysUntilExpiration:161 },
  { id:5,  jobCode:"SH-2003", community:"Palm Coast Estates",   city:"Jacksonville", lender:"TD Bank",                loanAmount:330000, totalDrawn:278000, drawPct:84.2, interestRate:7.10, expirationDate:"2026-07-05", daysUntilExpiration:103 },
  { id:18, jobCode:"SH-2006", community:"Palm Coast Estates",   city:"Jacksonville", lender:"First National Bank",    loanAmount:352000, totalDrawn:105000, drawPct:29.8, interestRate:7.25, expirationDate:"2026-11-10", daysUntilExpiration:231 },
  { id:19, jobCode:"SH-2008", community:"Palm Coast Estates",   city:"Jacksonville", lender:"SunTrust Builders",      loanAmount:336000, totalDrawn:185000, drawPct:55.1, interestRate:7.50, expirationDate:"2026-09-15", daysUntilExpiration:175 },

  /* Emerald Bay */
  { id:6,  jobCode:"SH-3001", community:"Emerald Bay",          city:"Tampa",        lender:"First National Bank",    loanAmount:360000, totalDrawn:142000, drawPct:39.4, interestRate:7.25, expirationDate:"2026-10-15", daysUntilExpiration:205 },
  { id:7,  jobCode:"SH-3002", community:"Emerald Bay",          city:"Tampa",        lender:"SunTrust Builders",      loanAmount:315000, totalDrawn:275000, drawPct:87.3, interestRate:7.50, expirationDate:"2026-04-25", daysUntilExpiration:32  },
  { id:8,  jobCode:"SH-3003", community:"Emerald Bay",          city:"Tampa",        lender:"Regions Construction",   loanAmount:340000, totalDrawn:190000, drawPct:55.9, interestRate:7.15, expirationDate:"2026-09-10", daysUntilExpiration:170 },
  { id:20, jobCode:"SH-3006", community:"Emerald Bay",          city:"Tampa",        lender:"Capital One CRE",        loanAmount:410000, totalDrawn:402000, drawPct:98.0, interestRate:7.00, expirationDate:"2026-04-01", daysUntilExpiration:8   },
  { id:21, jobCode:"SH-3007", community:"Emerald Bay",          city:"Tampa",        lender:"TD Bank",                loanAmount:290000, totalDrawn:148000, drawPct:51.0, interestRate:7.20, expirationDate:"2026-09-25", daysUntilExpiration:185 },

  /* Coral Springs Village */
  { id:9,  jobCode:"SH-4001", community:"Coral Springs Village",city:"Orlando",      lender:"Capital One CRE",        loanAmount:335000, totalDrawn:328000, drawPct:97.9, interestRate:7.00, expirationDate:"2026-04-01", daysUntilExpiration:8   },
  { id:10, jobCode:"SH-4002", community:"Coral Springs Village",city:"Orlando",      lender:"TD Bank",                loanAmount:370000, totalDrawn:302000, drawPct:81.6, interestRate:7.20, expirationDate:"2026-05-05", daysUntilExpiration:42  },
  { id:11, jobCode:"SH-4003", community:"Coral Springs Village",city:"Orlando",      lender:"First National Bank",    loanAmount:318000, totalDrawn:195000, drawPct:61.3, interestRate:7.25, expirationDate:"2026-08-28", daysUntilExpiration:157 },
  { id:22, jobCode:"SH-4006", community:"Coral Springs Village",city:"Orlando",      lender:"SunTrust Builders",      loanAmount:398000, totalDrawn:305000, drawPct:76.6, interestRate:7.50, expirationDate:"2026-07-15", daysUntilExpiration:113 },

  /* Magnolia Park */
  { id:12, jobCode:"SH-5001", community:"Magnolia Park",        city:"Tampa",        lender:"SunTrust Builders",      loanAmount:305000, totalDrawn:298000, drawPct:97.7, interestRate:7.50, expirationDate:"2026-03-30", daysUntilExpiration:6   },
  { id:13, jobCode:"SH-5002", community:"Magnolia Park",        city:"Tampa",        lender:"Regions Construction",   loanAmount:330000, totalDrawn:264000, drawPct:80.0, interestRate:7.35, expirationDate:"2026-07-20", daysUntilExpiration:118 },
  { id:14, jobCode:"SH-5003", community:"Magnolia Park",        city:"Tampa",        lender:"Capital One CRE",        loanAmount:355000, totalDrawn:120000, drawPct:33.8, interestRate:7.00, expirationDate:"2026-11-05", daysUntilExpiration:226 },
  { id:23, jobCode:"SH-5008", community:"Magnolia Park",        city:"Tampa",        lender:"TD Bank",                loanAmount:360000, totalDrawn:274000, drawPct:76.1, interestRate:7.20, expirationDate:"2026-07-28", daysUntilExpiration:126 },

  /* Cypress Landing */
  { id:15, jobCode:"SH-6001", community:"Cypress Landing",      city:"Jacksonville", lender:"TD Bank",                loanAmount:358000, totalDrawn:206000, drawPct:57.5, interestRate:7.20, expirationDate:"2026-09-05", daysUntilExpiration:165 },
  { id:16, jobCode:"SH-6002", community:"Cypress Landing",      city:"Jacksonville", lender:"First National Bank",    loanAmount:302000, totalDrawn:88000,  drawPct:29.1, interestRate:7.25, expirationDate:"2026-12-01", daysUntilExpiration:252 },
  { id:24, jobCode:"SH-6005", community:"Cypress Landing",      city:"Jacksonville", lender:"Regions Construction",   loanAmount:388000, totalDrawn:380000, drawPct:97.9, interestRate:7.35, expirationDate:"2026-04-05", daysUntilExpiration:12  },
  { id:25, jobCode:"SH-6007", community:"Cypress Landing",      city:"Jacksonville", lender:"Capital One CRE",        loanAmount:312000, totalDrawn:152000, drawPct:48.7, interestRate:7.00, expirationDate:"2026-10-01", daysUntilExpiration:191 },

  /* Lake Nona Shores */
  { id:26, jobCode:"SH-7001", community:"Lake Nona Shores",     city:"Orlando",      lender:"First National Bank",    loanAmount:415000, totalDrawn:375000, drawPct:90.4, interestRate:7.25, expirationDate:"2026-06-10", daysUntilExpiration:78  },
  { id:27, jobCode:"SH-7003", community:"Lake Nona Shores",     city:"Orlando",      lender:"SunTrust Builders",      loanAmount:352000, totalDrawn:205000, drawPct:58.2, interestRate:7.50, expirationDate:"2026-08-25", daysUntilExpiration:154 },
  { id:28, jobCode:"SH-7007", community:"Lake Nona Shores",     city:"Orlando",      lender:"Regions Construction",   loanAmount:328000, totalDrawn:270000, drawPct:82.3, interestRate:7.35, expirationDate:"2026-06-22", daysUntilExpiration:90  },

  /* Riverview Heights */
  { id:29, jobCode:"SH-8002", community:"Riverview Heights",    city:"Lakeland",     lender:"TD Bank",                loanAmount:292000, totalDrawn:162000, drawPct:55.5, interestRate:7.20, expirationDate:"2026-09-08", daysUntilExpiration:168 },
  { id:30, jobCode:"SH-8003", community:"Riverview Heights",    city:"Lakeland",     lender:"Capital One CRE",        loanAmount:338000, totalDrawn:284000, drawPct:84.0, interestRate:7.00, expirationDate:"2026-06-18", daysUntilExpiration:86  },
];

/* ─── Land Deals (15 total) ─── */
export const landDeals: SHLandDeal[] = [
  { id:1,  name:"Sunshine Ridge Phase 3",       city:"Orlando",      community:"Sunshine Ridge",       acres:28, lots:45, acquisitionCost:2250000, costPerLot:50000, status:"closed",         closeDate:"2025-01-15" },
  { id:2,  name:"Palm Coast South",             city:"Jacksonville", community:"Palm Coast Estates",   acres:22, lots:38, acquisitionCost:1520000, costPerLot:40000, status:"closed",         closeDate:"2025-03-20" },
  { id:3,  name:"Emerald Bay Phase 2",          city:"Tampa",        community:"Emerald Bay",          acres:35, lots:52, acquisitionCost:2600000, costPerLot:50000, status:"closed",         closeDate:"2025-06-10" },
  { id:4,  name:"Coral Springs Expansion",      city:"Orlando",      community:"Coral Springs Village",acres:18, lots:30, acquisitionCost:1350000, costPerLot:45000, status:"under-contract", closeDate:null },
  { id:5,  name:"Magnolia Park Phase 2",        city:"Tampa",        community:"Magnolia Park",        acres:24, lots:40, acquisitionCost:1680000, costPerLot:42000, status:"under-contract", closeDate:null },
  { id:6,  name:"Cypress Landing North",        city:"Jacksonville", community:"Cypress Landing",      acres:20, lots:35, acquisitionCost:1400000, costPerLot:40000, status:"under-contract", closeDate:null },
  { id:7,  name:"Lake Nona Shores Parcel A",    city:"Orlando",      community:"Lake Nona Shores",     acres:40, lots:65, acquisitionCost:3900000, costPerLot:60000, status:"closed",         closeDate:"2024-11-08" },
  { id:8,  name:"Riverview Heights Tract",      city:"Lakeland",     community:"Riverview Heights",    acres:18, lots:32, acquisitionCost:1120000, costPerLot:35000, status:"closed",         closeDate:"2025-02-12" },
  { id:9,  name:"Lake Nona Shores Parcel B",    city:"Orlando",      community:"Lake Nona Shores",     acres:25, lots:42, acquisitionCost:2520000, costPerLot:60000, status:"under-contract", closeDate:null },
  { id:10, name:"Sunshine Ridge Phase 4",       city:"Orlando",      community:"Sunshine Ridge",       acres:15, lots:24, acquisitionCost:1200000, costPerLot:50000, status:"under-contract", closeDate:null },
  { id:11, name:"Emerald Bay Phase 3",          city:"Tampa",        community:"Emerald Bay",          acres:30, lots:48, acquisitionCost:2400000, costPerLot:50000, status:"under-contract", closeDate:null },
  { id:12, name:"Palm Coast North Expansion",   city:"Jacksonville", community:"Palm Coast Estates",   acres:26, lots:44, acquisitionCost:1760000, costPerLot:40000, status:"under-contract", closeDate:null },
  { id:13, name:"Riverview Heights Phase 2",    city:"Lakeland",     community:"Riverview Heights",    acres:22, lots:38, acquisitionCost:1330000, costPerLot:35000, status:"under-contract", closeDate:null },
  { id:14, name:"South Tampa Reserve",          city:"Tampa",        community:"Magnolia Park",        acres:12, lots:20, acquisitionCost:900000,  costPerLot:45000, status:"cancelled",      closeDate:null },
  { id:15, name:"Ocoee Gateway",                city:"Orlando",      community:"Coral Springs Village",acres:10, lots:16, acquisitionCost:720000,  costPerLot:45000, status:"cancelled",      closeDate:null },
];

/* ─── Permits (20 total) ─── */
export const permits: SHPermit[] = [
  /* In-Review */
  { id:1,  jobCode:"SH-1006", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building",    submittedDate:"2026-02-22", approvedDate:null,         daysInReview:30, status:"in-review" },
  { id:2,  jobCode:"SH-3004", community:"Emerald Bay",          city:"Tampa",        permitType:"Building",    submittedDate:"2026-03-03", approvedDate:null,         daysInReview:21, status:"in-review" },
  { id:4,  jobCode:"SH-6003", community:"Cypress Landing",      city:"Jacksonville", permitType:"Building",    submittedDate:"2026-02-18", approvedDate:null,         daysInReview:34, status:"in-review" },
  { id:13, jobCode:"SH-7006", community:"Lake Nona Shores",     city:"Orlando",      permitType:"Building",    submittedDate:"2026-02-20", approvedDate:null,         daysInReview:32, status:"in-review" },

  /* Pending */
  { id:3,  jobCode:"SH-4005", community:"Coral Springs Village",city:"Orlando",      permitType:"Building",    submittedDate:"2026-02-27", approvedDate:null,         daysInReview:25, status:"pending" },
  { id:14, jobCode:"SH-1008", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building",    submittedDate:"2026-03-08", approvedDate:null,         daysInReview:16, status:"pending" },
  { id:15, jobCode:"SH-2007", community:"Palm Coast Estates",   city:"Jacksonville", permitType:"Building",    submittedDate:"2026-03-05", approvedDate:null,         daysInReview:19, status:"pending" },
  { id:16, jobCode:"SH-5007", community:"Magnolia Park",        city:"Tampa",        permitType:"Building",    submittedDate:"2026-03-02", approvedDate:null,         daysInReview:22, status:"pending" },
  { id:17, jobCode:"SH-8004", community:"Riverview Heights",    city:"Lakeland",     permitType:"Building",    submittedDate:"2026-03-05", approvedDate:null,         daysInReview:19, status:"pending" },

  /* Rejected */
  { id:18, jobCode:"SH-X010", community:"Lake Nona Shores",     city:"Orlando",      permitType:"Environmental",submittedDate:"2025-12-10", approvedDate:null,         daysInReview:45, status:"rejected" },
  { id:19, jobCode:"SH-X011", community:"Riverview Heights",    city:"Lakeland",     permitType:"Stormwater",  submittedDate:"2026-01-15", approvedDate:null,         daysInReview:38, status:"rejected" },

  /* Approved */
  { id:5,  jobCode:"SH-1001", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building",    submittedDate:"2025-06-12", approvedDate:"2025-06-20", daysInReview:8,  status:"approved" },
  { id:6,  jobCode:"SH-1002", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building",    submittedDate:"2025-08-22", approvedDate:"2025-09-01", daysInReview:10, status:"approved" },
  { id:7,  jobCode:"SH-2001", community:"Palm Coast Estates",   city:"Jacksonville", permitType:"Building",    submittedDate:"2025-09-03", approvedDate:"2025-09-12", daysInReview:9,  status:"approved" },
  { id:8,  jobCode:"SH-3001", community:"Emerald Bay",          city:"Tampa",        permitType:"Building",    submittedDate:"2025-10-17", approvedDate:"2025-10-28", daysInReview:11, status:"approved" },
  { id:9,  jobCode:"SH-4001", community:"Coral Springs Village",city:"Orlando",      permitType:"Building",    submittedDate:"2025-04-05", approvedDate:"2025-04-14", daysInReview:9,  status:"approved" },
  { id:10, jobCode:"SH-5001", community:"Magnolia Park",        city:"Tampa",        permitType:"Building",    submittedDate:"2025-03-05", approvedDate:"2025-03-14", daysInReview:9,  status:"approved" },
  { id:11, jobCode:"SH-6001", community:"Cypress Landing",      city:"Jacksonville", permitType:"Building",    submittedDate:"2025-09-08", approvedDate:"2025-09-18", daysInReview:10, status:"approved" },
  { id:12, jobCode:"SH-1004", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building",    submittedDate:"2026-01-08", approvedDate:"2026-01-18", daysInReview:10, status:"approved" },
  { id:20, jobCode:"SH-7001", community:"Lake Nona Shores",     city:"Orlando",      permitType:"Building",    submittedDate:"2025-06-05", approvedDate:"2025-06-14", daysInReview:9,  status:"approved" },
];

/* ─── Property Management (20 units) ─── */
export const propertyUnits: SHPropertyUnit[] = [
  /* Sunshine Ridge */
  { id:1,  address:"142 Sunshine Blvd",    community:"Sunshine Ridge",       city:"Orlando",      bedsBaths:"3/2", sqft:1983, monthlyRent:2450, marketRent:2500, occupancy:"leased",     tenant:"Rivera Family",    leaseEnd:"2026-08-31", delinquentAmount:0,    daysPastDue:0  },
  { id:2,  address:"158 Sunshine Blvd",    community:"Sunshine Ridge",       city:"Orlando",      bedsBaths:"4/2", sqft:2100, monthlyRent:2650, marketRent:2700, occupancy:"leased",     tenant:"Chen Family",      leaseEnd:"2026-11-30", delinquentAmount:0,    daysPastDue:0  },
  { id:13, address:"170 Sunshine Blvd",    community:"Sunshine Ridge",       city:"Orlando",      bedsBaths:"4/3", sqft:2306, monthlyRent:2900, marketRent:2950, occupancy:"leased",     tenant:"Diaz Family",      leaseEnd:"2027-02-28", delinquentAmount:0,    daysPastDue:0  },

  /* Palm Coast Estates */
  { id:3,  address:"204 Palm Coast Dr",    community:"Palm Coast Estates",   city:"Jacksonville", bedsBaths:"3/2", sqft:1983, monthlyRent:2200, marketRent:2250, occupancy:"leased",     tenant:"Nguyen Family",    leaseEnd:"2026-07-31", delinquentAmount:2200, daysPastDue:35 },
  { id:4,  address:"218 Palm Coast Dr",    community:"Palm Coast Estates",   city:"Jacksonville", bedsBaths:"4/3", sqft:2306, monthlyRent:2800, marketRent:2850, occupancy:"leased",     tenant:"Patel Family",     leaseEnd:"2027-01-31", delinquentAmount:0,    daysPastDue:0  },
  { id:14, address:"232 Palm Coast Dr",    community:"Palm Coast Estates",   city:"Jacksonville", bedsBaths:"3/2", sqft:1750, monthlyRent:2050, marketRent:2100, occupancy:"leased",     tenant:"Sanders Family",   leaseEnd:"2026-10-31", delinquentAmount:0,    daysPastDue:0  },

  /* Emerald Bay */
  { id:5,  address:"312 Emerald Bay Ln",   community:"Emerald Bay",          city:"Tampa",        bedsBaths:"3/2", sqft:1983, monthlyRent:0,    marketRent:2400, occupancy:"vacant",     tenant:null,               leaseEnd:null,         delinquentAmount:0,    daysPastDue:0  },
  { id:6,  address:"326 Emerald Bay Ln",   community:"Emerald Bay",          city:"Tampa",        bedsBaths:"4/2", sqft:2100, monthlyRent:2550, marketRent:2600, occupancy:"leased",     tenant:"Brooks Family",    leaseEnd:"2026-09-30", delinquentAmount:0,    daysPastDue:0  },

  /* Coral Springs Village */
  { id:7,  address:"410 Coral Springs Ct", community:"Coral Springs Village",city:"Orlando",      bedsBaths:"4/3", sqft:2306, monthlyRent:2900, marketRent:2950, occupancy:"leased",     tenant:"Kim Family",       leaseEnd:"2026-12-31", delinquentAmount:5800, daysPastDue:62 },
  { id:8,  address:"424 Coral Springs Ct", community:"Coral Springs Village",city:"Orlando",      bedsBaths:"3/2", sqft:1983, monthlyRent:2350, marketRent:2400, occupancy:"leased",     tenant:"Garcia Family",    leaseEnd:"2026-06-30", delinquentAmount:0,    daysPastDue:0  },
  { id:15, address:"438 Coral Springs Ct", community:"Coral Springs Village",city:"Orlando",      bedsBaths:"4/2", sqft:2450, monthlyRent:3100, marketRent:3150, occupancy:"leased",     tenant:"Owens Family",     leaseEnd:"2027-03-31", delinquentAmount:0,    daysPastDue:0  },

  /* Magnolia Park */
  { id:9,  address:"506 Magnolia Way",     community:"Magnolia Park",        city:"Tampa",        bedsBaths:"4/2", sqft:2100, monthlyRent:0,    marketRent:2500, occupancy:"make-ready", tenant:null,               leaseEnd:null,         delinquentAmount:0,    daysPastDue:0  },
  { id:10, address:"520 Magnolia Way",     community:"Magnolia Park",        city:"Tampa",        bedsBaths:"3/2", sqft:1983, monthlyRent:2300, marketRent:2350, occupancy:"leased",     tenant:"Thompson Family",  leaseEnd:"2026-10-31", delinquentAmount:0,    daysPastDue:0  },

  /* Cypress Landing */
  { id:11, address:"602 Cypress Ct",       community:"Cypress Landing",      city:"Jacksonville", bedsBaths:"4/3", sqft:2306, monthlyRent:2700, marketRent:2750, occupancy:"leased",     tenant:"Morgan Family",    leaseEnd:"2026-08-31", delinquentAmount:0,    daysPastDue:0  },
  { id:12, address:"616 Cypress Ct",       community:"Cypress Landing",      city:"Jacksonville", bedsBaths:"3/2", sqft:1983, monthlyRent:2150, marketRent:2200, occupancy:"eviction",   tenant:"Wilson Family",    leaseEnd:"2026-03-31", delinquentAmount:4300, daysPastDue:90 },

  /* Lake Nona Shores */
  { id:16, address:"102 Nona Shore Dr",    community:"Lake Nona Shores",     city:"Orlando",      bedsBaths:"4/3", sqft:2450, monthlyRent:3200, marketRent:3250, occupancy:"leased",     tenant:"Chang Family",     leaseEnd:"2027-01-31", delinquentAmount:0,    daysPastDue:0  },
  { id:17, address:"118 Nona Shore Dr",    community:"Lake Nona Shores",     city:"Orlando",      bedsBaths:"4/2", sqft:2100, monthlyRent:2750, marketRent:2800, occupancy:"leased",     tenant:"Reeves Family",    leaseEnd:"2026-09-30", delinquentAmount:2750, daysPastDue:28 },
  { id:18, address:"134 Nona Shore Dr",    community:"Lake Nona Shores",     city:"Orlando",      bedsBaths:"3/2", sqft:1750, monthlyRent:0,    marketRent:2200, occupancy:"make-ready", tenant:null,               leaseEnd:null,         delinquentAmount:0,    daysPastDue:0  },

  /* Riverview Heights */
  { id:19, address:"201 Riverview Blvd",   community:"Riverview Heights",    city:"Lakeland",     bedsBaths:"3/2", sqft:1983, monthlyRent:2100, marketRent:2150, occupancy:"leased",     tenant:"Fox Family",       leaseEnd:"2026-11-30", delinquentAmount:0,    daysPastDue:0  },
  { id:20, address:"215 Riverview Blvd",   community:"Riverview Heights",    city:"Lakeland",     bedsBaths:"4/2", sqft:2100, monthlyRent:2350, marketRent:2400, occupancy:"leased",     tenant:"Hayes Family",     leaseEnd:"2027-02-28", delinquentAmount:0,    daysPastDue:0  },
];

/* ─── Subdivisions (8 total) ─── */
export const subdivisions: SHSubdivision[] = [
  { id:1, projectName:"Sunshine Ridge Phase 3",    community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      totalLots:45, lotsSold:32, lotsUnderConstruction:8, lotsCompleted:22, lotsRemaining:13, totalAcres:28,  landCost:2250000, developmentCost:1800000, totalInvestment:4050000, projectedRevenue:22500000, projectedProfit:5625000, profitMarginPct:25.0, status:"active",           startDate:"2024-08-15", estCompletionDate:"2027-06-30", infraComplete:true,  zoningApproved:true,  platRecorded:true,  utilityStubs:true,  roadsComplete:true,  retentionPonds:true,  avgLotPrice:50000,  avgHomePrice:515000,  absorptionRate:2.8, monthsOfInventory:4.6 },
  { id:2, projectName:"Palm Coast Estates Phase 2", community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", totalLots:38, lotsSold:22, lotsUnderConstruction:8, lotsCompleted:12, lotsRemaining:16, totalAcres:22,  landCost:1520000, developmentCost:1140000, totalInvestment:2660000, projectedRevenue:17100000, projectedProfit:3990000, profitMarginPct:23.3, status:"active",           startDate:"2024-10-01", estCompletionDate:"2027-09-30", infraComplete:true,  zoningApproved:true,  platRecorded:true,  utilityStubs:true,  roadsComplete:true,  retentionPonds:true,  avgLotPrice:40000,  avgHomePrice:450000,  absorptionRate:2.2, monthsOfInventory:7.3 },
  { id:3, projectName:"Emerald Bay Phase 2",        community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      totalLots:52, lotsSold:38, lotsUnderConstruction:8, lotsCompleted:28, lotsRemaining:14, totalAcres:35,  landCost:2600000, developmentCost:2080000, totalInvestment:4680000, projectedRevenue:27040000, projectedProfit:7020000, profitMarginPct:26.0, status:"active",           startDate:"2024-06-10", estCompletionDate:"2027-03-31", infraComplete:true,  zoningApproved:true,  platRecorded:true,  utilityStubs:true,  roadsComplete:true,  retentionPonds:true,  avgLotPrice:50000,  avgHomePrice:520000,  absorptionRate:3.2, monthsOfInventory:4.4 },
  { id:4, projectName:"Coral Springs Village Ph 1", community:"Coral Springs Village",city:"Orlando",      entity:"Sunshine Homes LLC",      totalLots:30, lotsSold:28, lotsUnderConstruction:8, lotsCompleted:18, lotsRemaining:2,  totalAcres:18,  landCost:1350000, developmentCost:1080000, totalInvestment:2430000, projectedRevenue:15600000, projectedProfit:3900000, profitMarginPct:25.0, status:"active",           startDate:"2024-04-20", estCompletionDate:"2026-12-31", infraComplete:true,  zoningApproved:true,  platRecorded:true,  utilityStubs:true,  roadsComplete:true,  retentionPonds:true,  avgLotPrice:45000,  avgHomePrice:520000,  absorptionRate:2.5, monthsOfInventory:0.8 },
  { id:5, projectName:"Lake Nona Shores Parcel A",  community:"Lake Nona Shores",     city:"Orlando",      entity:"Sunshine Homes LLC",      totalLots:65, lotsSold:28, lotsUnderConstruction:10, lotsCompleted:8,  lotsRemaining:37, totalAcres:40,  landCost:3900000, developmentCost:3250000, totalInvestment:7150000, projectedRevenue:36400000, projectedProfit:9100000, profitMarginPct:25.0, status:"pre-development",  startDate:"2025-03-01", estCompletionDate:"2028-09-30", infraComplete:false, zoningApproved:true,  platRecorded:true,  utilityStubs:false, roadsComplete:false, retentionPonds:false, avgLotPrice:60000,  avgHomePrice:560000,  absorptionRate:2.0, monthsOfInventory:18.5 },
  { id:6, projectName:"Riverview Heights Phase 1",  community:"Riverview Heights",    city:"Lakeland",     entity:"Sunshine Homes East LLC", totalLots:32, lotsSold:14, lotsUnderConstruction:6, lotsCompleted:5,  lotsRemaining:18, totalAcres:18,  landCost:1120000, developmentCost:896000,  totalInvestment:2016000, projectedRevenue:14720000, projectedProfit:3312000, profitMarginPct:22.5, status:"pre-development",  startDate:"2025-01-15", estCompletionDate:"2028-03-31", infraComplete:false, zoningApproved:true,  platRecorded:false, utilityStubs:false, roadsComplete:false, retentionPonds:false, avgLotPrice:35000,  avgHomePrice:460000,  absorptionRate:1.8, monthsOfInventory:10.0 },
  { id:7, projectName:"Magnolia Park Phase 1",      community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", totalLots:40, lotsSold:40, lotsUnderConstruction:0, lotsCompleted:40, lotsRemaining:0,  totalAcres:24,  landCost:1680000, developmentCost:1344000, totalInvestment:3024000, projectedRevenue:19600000, projectedProfit:4900000, profitMarginPct:25.0, status:"sold-out",         startDate:"2023-06-01", estCompletionDate:"2026-06-30", infraComplete:true,  zoningApproved:true,  platRecorded:true,  utilityStubs:true,  roadsComplete:true,  retentionPonds:true,  avgLotPrice:42000,  avgHomePrice:490000,  absorptionRate:4.0, monthsOfInventory:0.0 },
  { id:8, projectName:"Cypress Landing Phase 2",    community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", totalLots:35, lotsSold:5,  lotsUnderConstruction:0, lotsCompleted:0,  lotsRemaining:30, totalAcres:20,  landCost:1400000, developmentCost:1050000, totalInvestment:2450000, projectedRevenue:16800000, projectedProfit:3780000, profitMarginPct:22.5, status:"planning",         startDate:"2026-01-01", estCompletionDate:"2029-01-31", infraComplete:false, zoningApproved:false, platRecorded:false, utilityStubs:false, roadsComplete:false, retentionPonds:false, avgLotPrice:40000,  avgHomePrice:480000,  absorptionRate:1.5, monthsOfInventory:20.0 },
];

/* ─── Formatting Helpers ─── */
export function fmt$(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000)     return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toLocaleString()}`;
}
export function fmtN(v: number): string { return v.toLocaleString(); }
export function fmtPct(v: number): string { return `${v.toFixed(1)}%`; }

/* ─── Filter Helper ─── */
export function matchFilters<T extends { community?: string; city?: string; entity?: string }>(
  item: T,
  filters: SHDashboardFilters,
): boolean {
  if (filters.city && item.city !== filters.city) return false;
  if (filters.entity && item.entity !== filters.entity) return false;
  if (filters.community && item.community !== filters.community) return false;
  return true;
}

/* ─── Derived KPI Functions ─── */

export function getConstructionKPIs(filteredJobs: SHJob[]) {
  const active = filteredJobs.filter(j => j.stage !== "Closing" && j.completionPct < 95);
  const totalWip = filteredJobs.reduce((s, j) => s + j.wipBalance, 0);
  const avgCompletion = filteredJobs.length
    ? filteredJobs.reduce((s, j) => s + j.completionPct, 0) / filteredJobs.length
    : 0;
  return {
    totalJobs: filteredJobs.length,
    activeJobs: active.length,
    avgCompletion,
    totalWip,
  };
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
  const activeSales = filteredSales.filter(s => s.status !== "cancelled");
  const totalValue = activeSales.reduce((s, r) => s + r.salePrice, 0);
  const avgPrice = activeSales.length ? totalValue / activeSales.length : 0;
  const pending = filteredSales.filter(s => s.status === "pending").length;
  return { totalSales: activeSales.length, totalValue, avgPrice, pendingClosings: pending };
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
  const avgDraw = filteredLoans.length ? totalDrawn / totalBalance * 100 : 0;
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
  const avgDays = filteredPermits.length
    ? filteredPermits.reduce((s, p) => s + p.daysInReview, 0) / filteredPermits.length
    : 0;
  return { total: filteredPermits.length, approved, inReview, pending, rejected, avgDaysToApproval: avgDays };
}

export function getPMKPIs(filteredUnits: SHPropertyUnit[]) {
  const leased = filteredUnits.filter(u => u.occupancy === "leased").length;
  const total = filteredUnits.length;
  const occupancyRate = total ? (leased / total) * 100 : 0;
  const totalRent = filteredUnits.reduce((s, u) => s + u.monthlyRent, 0);
  const delinquent = filteredUnits.filter(u => u.delinquentAmount > 0).length;
  return { totalUnits: total, occupancyRate, monthlyRent: totalRent, delinquentUnits: delinquent };
}

/* ─── Subdivision KPIs ─── */
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
    totalLots,
    totalSold,
    totalRemaining,
    soldPct: totalLots ? (totalSold / totalLots) * 100 : 0,
    totalInvestment,
    totalProjectedRevenue,
    totalProjectedProfit,
    avgAbsorption,
    avgMargin,
    activeSubs,
    preDev,
    soldOut,
    planning,
  };
}

/* ─── Cycle Time Data ─── */
export const avgPhaseDays = [
  { phase: "Permit",         days: 12, color: "#0f766e" },
  { phase: "Foundation",     days: 38, color: "#0d9488" },
  { phase: "Framing",        days: 52, color: "#14b8a6" },
  { phase: "MEP / Drywall",  days: 65, color: "#22d3ee" },
  { phase: "Finishes",       days: 58, color: "#3b82f6" },
  { phase: "Closing",        days: 15, color: "#1e40af" },
];

export const cycleTimeDistribution = [
  { bucket: "< 200d",    count: 8,  color: "#0f766e" },
  { bucket: "200–250d",  count: 18, color: "#14b8a6" },
  { bucket: "250–300d",  count: 20, color: "#22d3ee" },
  { bucket: "300–350d",  count: 10, color: "#3b82f6" },
  { bucket: "> 350d",    count: 4,  color: "#1e40af" },
];

/* ─── Cost Data ─── */
export function getCostKPIs(filteredJobs: SHJob[]) {
  const totalBudget = filteredJobs.reduce((s, j) => s + j.originalBudget, 0);
  const totalActual = filteredJobs.reduce((s, j) => s + j.actualCostToDate, 0);
  const variance = totalActual - totalBudget;
  const avgMargin = filteredJobs.length
    ? filteredJobs.reduce((s, j) => s + j.marginPct, 0) / filteredJobs.length
    : 0;
  return { totalBudget, totalActual, variance, avgMargin };
}

export function getCostBreakdown() {
  return [
    { label: "Labor",           value: 8400000,  color: "#14b8a6" },
    { label: "Materials",       value: 6200000,  color: "#0d9488" },
    { label: "Subcontractors",  value: 4800000,  color: "#22d3ee" },
    { label: "Land & Permits",  value: 3600000,  color: "#3b82f6" },
    { label: "Overhead",        value: 1800000,  color: "#1e40af" },
  ];
}

/* ─── Shared Constants ─── */
export { COMMUNITIES, CITIES, ENTITIES, PLANS, SUPERS, STAGES, LENDERS, COMM_META };
