/* ── Sunshine Homes Demo Data ──
   Static mock data for the marketing-site dashboard demo.
   All numbers are realistic for a mid-size Florida production builder. */

import type {
  SHJob, SHSale, SHLoan, SHLandDeal, SHPermit, SHPropertyUnit,
  SHDashboardFilters, SHSectionDef,
} from "@/types/sunshine-homes";

/* ─── Navigation ─── */
export const SECTIONS: SHSectionDef[] = [
  { id: "land",        label: "LAND",         tabs: [{ id: "land-dashboard",         label: "Dashboard" }] },
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
const COMMUNITIES = ["Sunshine Ridge", "Palm Coast Estates", "Emerald Bay", "Coral Springs Village", "Magnolia Park", "Cypress Landing"] as const;
const CITIES = ["Orlando", "Tampa", "Jacksonville"] as const;
const ENTITIES = ["Sunshine Homes LLC", "Sunshine Homes East LLC"] as const;
const PLANS = ["Avalon 1983", "Harmon 2100", "Seville 2306"] as const;
const SUPERS = ["Mike Torres", "Sarah Chen", "David Brooks", "Lisa Nguyen"] as const;
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
};

/* ─── Jobs (30 total) ─── */
export const jobs: SHJob[] = [
  /* Sunshine Ridge – Orlando (6 jobs) */
  { id:1,  jobCode:"SH-1001", lot:"Lot 14",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",  superintendent:"Mike Torres",  stage:"Finishes",       completionPct:88, startDate:"2025-06-10", estCompletion:"2026-04-15", contractValue:485000, estimatedCost:362000, actualCostToDate:318000, wipBalance:318000, lotCost:52000, originalBudget:370000, projectedFinalCost:368000, margin:117000, marginPct:24.1, daysInCurrentPhase:18, totalCycleDays:280, permitDate:"2025-06-20", foundationDate:"2025-07-25", framingDate:"2025-09-10", mepDate:"2025-11-05", drywallDate:"2025-12-20", finishesDate:"2026-02-15", coDate:null, closingDate:null },
  { id:2,  jobCode:"SH-1002", lot:"Lot 15",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",  superintendent:"Mike Torres",  stage:"MEP / Drywall", completionPct:62, startDate:"2025-08-20", estCompletion:"2026-06-10", contractValue:520000, estimatedCost:388000, actualCostToDate:240000, wipBalance:240000, lotCost:52000, originalBudget:395000, projectedFinalCost:392000, margin:128000, marginPct:24.6, daysInCurrentPhase:32, totalCycleDays:210, permitDate:"2025-09-01", foundationDate:"2025-10-05", framingDate:"2025-11-20", mepDate:"2026-01-15", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:3,  jobCode:"SH-1003", lot:"Lot 22",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306", superintendent:"Sarah Chen",   stage:"Framing",        completionPct:35, startDate:"2025-11-01", estCompletion:"2026-08-20", contractValue:565000, estimatedCost:422000, actualCostToDate:148000, wipBalance:148000, lotCost:52000, originalBudget:430000, projectedFinalCost:428000, margin:137000, marginPct:24.2, daysInCurrentPhase:22, totalCycleDays:140, permitDate:"2025-11-15", foundationDate:"2025-12-20", framingDate:"2026-02-01", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:4,  jobCode:"SH-1004", lot:"Lot 23",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",  superintendent:"Sarah Chen",   stage:"Foundation",     completionPct:15, startDate:"2026-01-05", estCompletion:"2026-10-15", contractValue:490000, estimatedCost:365000, actualCostToDate:55000,  wipBalance:55000,  lotCost:52000, originalBudget:372000, projectedFinalCost:370000, margin:120000, marginPct:24.5, daysInCurrentPhase:14, totalCycleDays:78,  permitDate:"2026-01-18", foundationDate:"2026-02-20", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:5,  jobCode:"SH-1005", lot:"Lot 30",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",  superintendent:"Mike Torres",  stage:"Closing",        completionPct:98, startDate:"2025-03-15", estCompletion:"2026-03-28", contractValue:525000, estimatedCost:390000, actualCostToDate:388000, wipBalance:388000, lotCost:52000, originalBudget:398000, projectedFinalCost:393000, margin:132000, marginPct:25.1, daysInCurrentPhase:8,  totalCycleDays:365, permitDate:"2025-03-28", foundationDate:"2025-05-10", framingDate:"2025-07-05", mepDate:"2025-09-01", drywallDate:"2025-10-20", finishesDate:"2025-12-15", coDate:"2026-03-10", closingDate:null },
  { id:6,  jobCode:"SH-1006", lot:"Lot 31",  community:"Sunshine Ridge",       city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306", superintendent:"Mike Torres",  stage:"Permit",         completionPct:5,  startDate:"2026-02-20", estCompletion:"2026-12-01", contractValue:570000, estimatedCost:425000, actualCostToDate:12000,  wipBalance:12000,  lotCost:52000, originalBudget:432000, projectedFinalCost:430000, margin:140000, marginPct:24.6, daysInCurrentPhase:32, totalCycleDays:32,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Palm Coast Estates – Jacksonville (5 jobs) */
  { id:7,  jobCode:"SH-2001", lot:"Lot 3",   community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Harmon 2100",  superintendent:"David Brooks",  stage:"MEP / Drywall", completionPct:58, startDate:"2025-09-01", estCompletion:"2026-06-20", contractValue:445000, estimatedCost:332000, actualCostToDate:192000, wipBalance:192000, lotCost:38000, originalBudget:340000, projectedFinalCost:338000, margin:107000, marginPct:24.0, daysInCurrentPhase:28, totalCycleDays:200, permitDate:"2025-09-12", foundationDate:"2025-10-18", framingDate:"2025-12-02", mepDate:"2026-01-20", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:8,  jobCode:"SH-2002", lot:"Lot 4",   community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Avalon 1983",  superintendent:"David Brooks",  stage:"Framing",        completionPct:32, startDate:"2025-11-10", estCompletion:"2026-08-28", contractValue:410000, estimatedCost:306000, actualCostToDate:98000,  wipBalance:98000,  lotCost:38000, originalBudget:312000, projectedFinalCost:310000, margin:100000, marginPct:24.4, daysInCurrentPhase:18, totalCycleDays:134, permitDate:"2025-11-22", foundationDate:"2026-01-05", framingDate:"2026-02-10", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:9,  jobCode:"SH-2003", lot:"Lot 8",   community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Seville 2306", superintendent:"Lisa Nguyen",   stage:"Finishes",       completionPct:82, startDate:"2025-07-05", estCompletion:"2026-04-25", contractValue:498000, estimatedCost:372000, actualCostToDate:305000, wipBalance:305000, lotCost:38000, originalBudget:380000, projectedFinalCost:376000, margin:122000, marginPct:24.5, daysInCurrentPhase:25, totalCycleDays:258, permitDate:"2025-07-18", foundationDate:"2025-08-22", framingDate:"2025-10-10", mepDate:"2025-12-05", drywallDate:"2026-01-15", finishesDate:"2026-02-20", coDate:null, closingDate:null },
  { id:10, jobCode:"SH-2004", lot:"Lot 11",  community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Harmon 2100",  superintendent:"David Brooks",  stage:"Foundation",     completionPct:12, startDate:"2026-01-15", estCompletion:"2026-10-28", contractValue:450000, estimatedCost:336000, actualCostToDate:40000,  wipBalance:40000,  lotCost:38000, originalBudget:342000, projectedFinalCost:340000, margin:110000, marginPct:24.4, daysInCurrentPhase:10, totalCycleDays:68,  permitDate:"2026-01-28", foundationDate:"2026-03-01", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:11, jobCode:"SH-2005", lot:"Lot 12",  community:"Palm Coast Estates",   city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Avalon 1983",  superintendent:"Lisa Nguyen",   stage:"Closing",        completionPct:96, startDate:"2025-04-20", estCompletion:"2026-03-30", contractValue:415000, estimatedCost:310000, actualCostToDate:308000, wipBalance:308000, lotCost:38000, originalBudget:316000, projectedFinalCost:312000, margin:103000, marginPct:24.8, daysInCurrentPhase:5,  totalCycleDays:335, permitDate:"2025-05-02", foundationDate:"2025-06-15", framingDate:"2025-08-10", mepDate:"2025-10-05", drywallDate:"2025-11-18", finishesDate:"2026-01-10", coDate:"2026-03-15", closingDate:null },

  /* Emerald Bay – Tampa (5 jobs) */
  { id:12, jobCode:"SH-3001", lot:"Lot 7",   community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Seville 2306", superintendent:"Sarah Chen",   stage:"Framing",        completionPct:38, startDate:"2025-10-15", estCompletion:"2026-08-05", contractValue:545000, estimatedCost:407000, actualCostToDate:155000, wipBalance:155000, lotCost:48000, originalBudget:415000, projectedFinalCost:412000, margin:133000, marginPct:24.4, daysInCurrentPhase:20, totalCycleDays:160, permitDate:"2025-10-28", foundationDate:"2025-12-05", framingDate:"2026-01-18", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:13, jobCode:"SH-3002", lot:"Lot 9",   community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Avalon 1983",  superintendent:"Sarah Chen",   stage:"Finishes",       completionPct:85, startDate:"2025-06-25", estCompletion:"2026-04-20", contractValue:475000, estimatedCost:355000, actualCostToDate:302000, wipBalance:302000, lotCost:48000, originalBudget:362000, projectedFinalCost:358000, margin:117000, marginPct:24.6, daysInCurrentPhase:22, totalCycleDays:268, permitDate:"2025-07-08", foundationDate:"2025-08-15", framingDate:"2025-10-01", mepDate:"2025-11-28", drywallDate:"2026-01-10", finishesDate:"2026-02-18", coDate:null, closingDate:null },
  { id:14, jobCode:"SH-3003", lot:"Lot 16",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Harmon 2100",  superintendent:"Mike Torres",  stage:"MEP / Drywall", completionPct:55, startDate:"2025-09-10", estCompletion:"2026-06-28", contractValue:510000, estimatedCost:380000, actualCostToDate:209000, wipBalance:209000, lotCost:48000, originalBudget:388000, projectedFinalCost:385000, margin:125000, marginPct:24.5, daysInCurrentPhase:30, totalCycleDays:195, permitDate:"2025-09-22", foundationDate:"2025-10-28", framingDate:"2025-12-15", mepDate:"2026-02-01", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:15, jobCode:"SH-3004", lot:"Lot 20",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Seville 2306", superintendent:"Sarah Chen",   stage:"Permit",         completionPct:3,  startDate:"2026-03-01", estCompletion:"2026-12-15", contractValue:550000, estimatedCost:410000, actualCostToDate:8000,   wipBalance:8000,   lotCost:48000, originalBudget:418000, projectedFinalCost:415000, margin:135000, marginPct:24.5, daysInCurrentPhase:23, totalCycleDays:23,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:16, jobCode:"SH-3005", lot:"Lot 21",  community:"Emerald Bay",          city:"Tampa",        entity:"Sunshine Homes LLC",      plan:"Avalon 1983",  superintendent:"Mike Torres",  stage:"Foundation",     completionPct:18, startDate:"2025-12-20", estCompletion:"2026-09-30", contractValue:480000, estimatedCost:358000, actualCostToDate:64000,  wipBalance:64000,  lotCost:48000, originalBudget:365000, projectedFinalCost:362000, margin:118000, marginPct:24.6, daysInCurrentPhase:12, totalCycleDays:94,  permitDate:"2026-01-05", foundationDate:"2026-02-10", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Coral Springs Village – Orlando (5 jobs) */
  { id:17, jobCode:"SH-4001", lot:"Lot 2",   community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",  superintendent:"Lisa Nguyen",   stage:"Closing",        completionPct:97, startDate:"2025-04-01", estCompletion:"2026-03-25", contractValue:505000, estimatedCost:376000, actualCostToDate:374000, wipBalance:374000, lotCost:45000, originalBudget:382000, projectedFinalCost:378000, margin:127000, marginPct:25.1, daysInCurrentPhase:6,  totalCycleDays:355, permitDate:"2025-04-14", foundationDate:"2025-05-28", framingDate:"2025-07-22", mepDate:"2025-09-18", drywallDate:"2025-11-02", finishesDate:"2026-01-05", coDate:"2026-03-08", closingDate:null },
  { id:18, jobCode:"SH-4002", lot:"Lot 5",   community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306", superintendent:"Lisa Nguyen",   stage:"Finishes",       completionPct:80, startDate:"2025-07-15", estCompletion:"2026-05-05", contractValue:555000, estimatedCost:414000, actualCostToDate:331000, wipBalance:331000, lotCost:45000, originalBudget:422000, projectedFinalCost:418000, margin:137000, marginPct:24.7, daysInCurrentPhase:20, totalCycleDays:250, permitDate:"2025-07-28", foundationDate:"2025-09-02", framingDate:"2025-10-20", mepDate:"2025-12-15", drywallDate:"2026-01-28", finishesDate:"2026-03-01", coDate:null, closingDate:null },
  { id:19, jobCode:"SH-4003", lot:"Lot 10",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Avalon 1983",  superintendent:"David Brooks",  stage:"MEP / Drywall", completionPct:60, startDate:"2025-08-28", estCompletion:"2026-06-15", contractValue:478000, estimatedCost:356000, actualCostToDate:214000, wipBalance:214000, lotCost:45000, originalBudget:364000, projectedFinalCost:360000, margin:118000, marginPct:24.7, daysInCurrentPhase:26, totalCycleDays:205, permitDate:"2025-09-10", foundationDate:"2025-10-15", framingDate:"2025-12-01", mepDate:"2026-01-22", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:20, jobCode:"SH-4004", lot:"Lot 17",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Harmon 2100",  superintendent:"David Brooks",  stage:"Framing",        completionPct:30, startDate:"2025-11-20", estCompletion:"2026-09-05", contractValue:508000, estimatedCost:378000, actualCostToDate:113000, wipBalance:113000, lotCost:45000, originalBudget:386000, projectedFinalCost:382000, margin:126000, marginPct:24.8, daysInCurrentPhase:15, totalCycleDays:124, permitDate:"2025-12-05", foundationDate:"2026-01-10", framingDate:"2026-02-15", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:21, jobCode:"SH-4005", lot:"Lot 18",  community:"Coral Springs Village", city:"Orlando",      entity:"Sunshine Homes LLC",      plan:"Seville 2306", superintendent:"Lisa Nguyen",   stage:"Permit",         completionPct:4,  startDate:"2026-02-25", estCompletion:"2026-12-10", contractValue:560000, estimatedCost:418000, actualCostToDate:10000,  wipBalance:10000,  lotCost:45000, originalBudget:426000, projectedFinalCost:422000, margin:138000, marginPct:24.6, daysInCurrentPhase:27, totalCycleDays:27,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Magnolia Park – Tampa (5 jobs) */
  { id:22, jobCode:"SH-5001", lot:"Lot 1",   community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Avalon 1983",  superintendent:"Mike Torres",  stage:"Closing",        completionPct:99, startDate:"2025-03-01", estCompletion:"2026-03-20", contractValue:462000, estimatedCost:345000, actualCostToDate:343000, wipBalance:343000, lotCost:42000, originalBudget:352000, projectedFinalCost:348000, margin:114000, marginPct:24.7, daysInCurrentPhase:4,  totalCycleDays:380, permitDate:"2025-03-14", foundationDate:"2025-04-28", framingDate:"2025-06-22", mepDate:"2025-08-18", drywallDate:"2025-10-01", finishesDate:"2025-12-02", coDate:"2026-03-05", closingDate:null },
  { id:23, jobCode:"SH-5002", lot:"Lot 6",   community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Harmon 2100",  superintendent:"Sarah Chen",   stage:"Finishes",       completionPct:78, startDate:"2025-07-20", estCompletion:"2026-05-10", contractValue:498000, estimatedCost:372000, actualCostToDate:290000, wipBalance:290000, lotCost:42000, originalBudget:380000, projectedFinalCost:376000, margin:122000, marginPct:24.5, daysInCurrentPhase:16, totalCycleDays:245, permitDate:"2025-08-02", foundationDate:"2025-09-08", framingDate:"2025-10-25", mepDate:"2025-12-20", drywallDate:"2026-02-01", finishesDate:"2026-03-05", coDate:null, closingDate:null },
  { id:24, jobCode:"SH-5003", lot:"Lot 13",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Seville 2306", superintendent:"Sarah Chen",   stage:"Framing",        completionPct:33, startDate:"2025-11-05", estCompletion:"2026-08-15", contractValue:535000, estimatedCost:399000, actualCostToDate:132000, wipBalance:132000, lotCost:42000, originalBudget:406000, projectedFinalCost:404000, margin:131000, marginPct:24.5, daysInCurrentPhase:19, totalCycleDays:139, permitDate:"2025-11-18", foundationDate:"2025-12-22", framingDate:"2026-02-05", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:25, jobCode:"SH-5004", lot:"Lot 19",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Avalon 1983",  superintendent:"Mike Torres",  stage:"Foundation",     completionPct:14, startDate:"2026-01-10", estCompletion:"2026-10-20", contractValue:468000, estimatedCost:349000, actualCostToDate:49000,  wipBalance:49000,  lotCost:42000, originalBudget:356000, projectedFinalCost:353000, margin:115000, marginPct:24.6, daysInCurrentPhase:11, totalCycleDays:73,  permitDate:"2026-01-22", foundationDate:"2026-02-25", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:26, jobCode:"SH-5005", lot:"Lot 24",  community:"Magnolia Park",        city:"Tampa",        entity:"Sunshine Homes East LLC", plan:"Harmon 2100",  superintendent:"Sarah Chen",   stage:"MEP / Drywall", completionPct:52, startDate:"2025-09-18", estCompletion:"2026-07-05", contractValue:502000, estimatedCost:374000, actualCostToDate:195000, wipBalance:195000, lotCost:42000, originalBudget:382000, projectedFinalCost:378000, margin:124000, marginPct:24.7, daysInCurrentPhase:24, totalCycleDays:188, permitDate:"2025-10-01", foundationDate:"2025-11-05", framingDate:"2025-12-20", mepDate:"2026-02-08", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Cypress Landing – Jacksonville (4 jobs) */
  { id:27, jobCode:"SH-6001", lot:"Lot 25",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Seville 2306", superintendent:"David Brooks",  stage:"MEP / Drywall", completionPct:56, startDate:"2025-09-05", estCompletion:"2026-06-25", contractValue:542000, estimatedCost:404000, actualCostToDate:226000, wipBalance:226000, lotCost:40000, originalBudget:412000, projectedFinalCost:408000, margin:134000, marginPct:24.7, daysInCurrentPhase:29, totalCycleDays:198, permitDate:"2025-09-18", foundationDate:"2025-10-22", framingDate:"2025-12-08", mepDate:"2026-01-25", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:28, jobCode:"SH-6002", lot:"Lot 26",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Avalon 1983",  superintendent:"Lisa Nguyen",   stage:"Framing",        completionPct:28, startDate:"2025-12-01", estCompletion:"2026-09-12", contractValue:458000, estimatedCost:342000, actualCostToDate:96000,  wipBalance:96000,  lotCost:40000, originalBudget:348000, projectedFinalCost:346000, margin:112000, marginPct:24.5, daysInCurrentPhase:16, totalCycleDays:113, permitDate:"2025-12-14", foundationDate:"2026-01-18", framingDate:"2026-03-01", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:29, jobCode:"SH-6003", lot:"Lot 27",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Harmon 2100",  superintendent:"David Brooks",  stage:"Permit",         completionPct:6,  startDate:"2026-02-15", estCompletion:"2026-11-25", contractValue:465000, estimatedCost:347000, actualCostToDate:14000,  wipBalance:14000,  lotCost:40000, originalBudget:354000, projectedFinalCost:350000, margin:115000, marginPct:24.7, daysInCurrentPhase:37, totalCycleDays:37,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:30, jobCode:"SH-6004", lot:"Lot 28",  community:"Cypress Landing",      city:"Jacksonville", entity:"Sunshine Homes East LLC", plan:"Seville 2306", superintendent:"Lisa Nguyen",   stage:"Foundation",     completionPct:10, startDate:"2026-01-20", estCompletion:"2026-10-30", contractValue:548000, estimatedCost:408000, actualCostToDate:41000,  wipBalance:41000,  lotCost:40000, originalBudget:416000, projectedFinalCost:412000, margin:136000, marginPct:24.8, daysInCurrentPhase:8,  totalCycleDays:63,  permitDate:"2026-02-02", foundationDate:"2026-03-08", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
];

/* ─── Sales ─── */
export const sales: SHSale[] = [
  { id:1,  jobCode:"SH-1001", community:"Sunshine Ridge",       city:"Orlando",      plan:"Avalon 1983",  buyer:"Johnson Family",   salePrice:485000, contractDate:"2025-05-20", closingDate:null,         status:"active" },
  { id:2,  jobCode:"SH-1002", community:"Sunshine Ridge",       city:"Orlando",      plan:"Harmon 2100",  buyer:"Martinez Family",  salePrice:520000, contractDate:"2025-07-15", closingDate:null,         status:"active" },
  { id:3,  jobCode:"SH-1003", community:"Sunshine Ridge",       city:"Orlando",      plan:"Seville 2306", buyer:"Williams Family",  salePrice:565000, contractDate:"2025-10-10", closingDate:null,         status:"active" },
  { id:4,  jobCode:"SH-1005", community:"Sunshine Ridge",       city:"Orlando",      plan:"Harmon 2100",  buyer:"Davis Family",     salePrice:525000, contractDate:"2025-02-28", closingDate:"2026-03-28", status:"pending" },
  { id:5,  jobCode:"SH-2001", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Harmon 2100",  buyer:"Brown Family",     salePrice:445000, contractDate:"2025-08-12", closingDate:null,         status:"active" },
  { id:6,  jobCode:"SH-2003", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Seville 2306", buyer:"Taylor Family",    salePrice:498000, contractDate:"2025-06-18", closingDate:null,         status:"active" },
  { id:7,  jobCode:"SH-2005", community:"Palm Coast Estates",   city:"Jacksonville", plan:"Avalon 1983",  buyer:"Anderson Family",  salePrice:415000, contractDate:"2025-03-30", closingDate:"2026-03-30", status:"pending" },
  { id:8,  jobCode:"SH-3001", community:"Emerald Bay",          city:"Tampa",        plan:"Seville 2306", buyer:"Thomas Family",    salePrice:545000, contractDate:"2025-09-25", closingDate:null,         status:"active" },
  { id:9,  jobCode:"SH-3002", community:"Emerald Bay",          city:"Tampa",        plan:"Avalon 1983",  buyer:"Jackson Family",   salePrice:475000, contractDate:"2025-06-05", closingDate:null,         status:"active" },
  { id:10, jobCode:"SH-3003", community:"Emerald Bay",          city:"Tampa",        plan:"Harmon 2100",  buyer:"White Family",     salePrice:510000, contractDate:"2025-08-20", closingDate:null,         status:"active" },
  { id:11, jobCode:"SH-4001", community:"Coral Springs Village",city:"Orlando",      plan:"Harmon 2100",  buyer:"Harris Family",    salePrice:505000, contractDate:"2025-03-15", closingDate:"2026-03-25", status:"pending" },
  { id:12, jobCode:"SH-4002", community:"Coral Springs Village",city:"Orlando",      plan:"Seville 2306", buyer:"Clark Family",     salePrice:555000, contractDate:"2025-06-28", closingDate:null,         status:"active" },
  { id:13, jobCode:"SH-4003", community:"Coral Springs Village",city:"Orlando",      plan:"Avalon 1983",  buyer:"Lewis Family",     salePrice:478000, contractDate:"2025-08-10", closingDate:null,         status:"active" },
  { id:14, jobCode:"SH-5001", community:"Magnolia Park",        city:"Tampa",        plan:"Avalon 1983",  buyer:"Robinson Family",  salePrice:462000, contractDate:"2025-02-15", closingDate:"2026-03-20", status:"pending" },
  { id:15, jobCode:"SH-5002", community:"Magnolia Park",        city:"Tampa",        plan:"Harmon 2100",  buyer:"Walker Family",    salePrice:498000, contractDate:"2025-07-02", closingDate:null,         status:"active" },
  { id:16, jobCode:"SH-5003", community:"Magnolia Park",        city:"Tampa",        plan:"Seville 2306", buyer:"Young Family",     salePrice:535000, contractDate:"2025-10-18", closingDate:null,         status:"active" },
  { id:17, jobCode:"SH-6001", community:"Cypress Landing",      city:"Jacksonville", plan:"Seville 2306", buyer:"King Family",      salePrice:542000, contractDate:"2025-08-22", closingDate:null,         status:"active" },
  { id:18, jobCode:"SH-6002", community:"Cypress Landing",      city:"Jacksonville", plan:"Avalon 1983",  buyer:"Wright Family",    salePrice:458000, contractDate:"2025-11-15", closingDate:null,         status:"active" },
  /* A few cancelled for realism */
  { id:19, jobCode:"SH-X001", community:"Sunshine Ridge",       city:"Orlando",      plan:"Avalon 1983",  buyer:"Green Family",     salePrice:488000, contractDate:"2025-04-10", closingDate:null,         status:"cancelled" },
  { id:20, jobCode:"SH-X002", community:"Emerald Bay",          city:"Tampa",        plan:"Harmon 2100",  buyer:"Adams Family",     salePrice:515000, contractDate:"2025-09-05", closingDate:null,         status:"cancelled" },
];

/* ─── Loans ─── */
export const loans: SHLoan[] = [
  { id:1,  jobCode:"SH-1001", community:"Sunshine Ridge",       city:"Orlando",      lender:"First National Bank",    loanAmount:340000, totalDrawn:295000, drawPct:86.8, interestRate:7.25, expirationDate:"2026-06-10", daysUntilExpiration:78 },
  { id:2,  jobCode:"SH-1002", community:"Sunshine Ridge",       city:"Orlando",      lender:"SunTrust Builders",      loanAmount:365000, totalDrawn:218000, drawPct:59.7, interestRate:7.50, expirationDate:"2026-08-20", daysUntilExpiration:149 },
  { id:3,  jobCode:"SH-1003", community:"Sunshine Ridge",       city:"Orlando",      lender:"Capital One CRE",        loanAmount:380000, totalDrawn:135000, drawPct:35.5, interestRate:7.00, expirationDate:"2026-11-01", daysUntilExpiration:222 },
  { id:4,  jobCode:"SH-2001", community:"Palm Coast Estates",   city:"Jacksonville", lender:"Regions Construction",   loanAmount:295000, totalDrawn:175000, drawPct:59.3, interestRate:7.35, expirationDate:"2026-09-01", daysUntilExpiration:161 },
  { id:5,  jobCode:"SH-2003", community:"Palm Coast Estates",   city:"Jacksonville", lender:"TD Bank",                loanAmount:330000, totalDrawn:278000, drawPct:84.2, interestRate:7.10, expirationDate:"2026-07-05", daysUntilExpiration:103 },
  { id:6,  jobCode:"SH-3001", community:"Emerald Bay",          city:"Tampa",        lender:"First National Bank",    loanAmount:360000, totalDrawn:142000, drawPct:39.4, interestRate:7.25, expirationDate:"2026-10-15", daysUntilExpiration:205 },
  { id:7,  jobCode:"SH-3002", community:"Emerald Bay",          city:"Tampa",        lender:"SunTrust Builders",      loanAmount:315000, totalDrawn:275000, drawPct:87.3, interestRate:7.50, expirationDate:"2026-04-25", daysUntilExpiration:32 },
  { id:8,  jobCode:"SH-3003", community:"Emerald Bay",          city:"Tampa",        lender:"Regions Construction",   loanAmount:340000, totalDrawn:190000, drawPct:55.9, interestRate:7.15, expirationDate:"2026-09-10", daysUntilExpiration:170 },
  { id:9,  jobCode:"SH-4001", community:"Coral Springs Village",city:"Orlando",      lender:"Capital One CRE",        loanAmount:335000, totalDrawn:328000, drawPct:97.9, interestRate:7.00, expirationDate:"2026-04-01", daysUntilExpiration:8 },
  { id:10, jobCode:"SH-4002", community:"Coral Springs Village",city:"Orlando",      lender:"TD Bank",                loanAmount:370000, totalDrawn:302000, drawPct:81.6, interestRate:7.20, expirationDate:"2026-05-05", daysUntilExpiration:42 },
  { id:11, jobCode:"SH-4003", community:"Coral Springs Village",city:"Orlando",      lender:"First National Bank",    loanAmount:318000, totalDrawn:195000, drawPct:61.3, interestRate:7.25, expirationDate:"2026-08-28", daysUntilExpiration:157 },
  { id:12, jobCode:"SH-5001", community:"Magnolia Park",        city:"Tampa",        lender:"SunTrust Builders",      loanAmount:305000, totalDrawn:298000, drawPct:97.7, interestRate:7.50, expirationDate:"2026-03-30", daysUntilExpiration:6 },
  { id:13, jobCode:"SH-5002", community:"Magnolia Park",        city:"Tampa",        lender:"Regions Construction",   loanAmount:330000, totalDrawn:264000, drawPct:80.0, interestRate:7.35, expirationDate:"2026-07-20", daysUntilExpiration:118 },
  { id:14, jobCode:"SH-5003", community:"Magnolia Park",        city:"Tampa",        lender:"Capital One CRE",        loanAmount:355000, totalDrawn:120000, drawPct:33.8, interestRate:7.00, expirationDate:"2026-11-05", daysUntilExpiration:226 },
  { id:15, jobCode:"SH-6001", community:"Cypress Landing",      city:"Jacksonville", lender:"TD Bank",                loanAmount:358000, totalDrawn:206000, drawPct:57.5, interestRate:7.20, expirationDate:"2026-09-05", daysUntilExpiration:165 },
  { id:16, jobCode:"SH-6002", community:"Cypress Landing",      city:"Jacksonville", lender:"First National Bank",    loanAmount:302000, totalDrawn:88000,  drawPct:29.1, interestRate:7.25, expirationDate:"2026-12-01", daysUntilExpiration:252 },
];

/* ─── Land Deals ─── */
export const landDeals: SHLandDeal[] = [
  { id:1, name:"Sunshine Ridge Phase 3",  city:"Orlando",      community:"Sunshine Ridge",       acres:28, lots:45, acquisitionCost:2250000, costPerLot:50000, status:"closed",         closeDate:"2025-01-15" },
  { id:2, name:"Palm Coast South",        city:"Jacksonville", community:"Palm Coast Estates",   acres:22, lots:38, acquisitionCost:1520000, costPerLot:40000, status:"closed",         closeDate:"2025-03-20" },
  { id:3, name:"Emerald Bay Phase 2",     city:"Tampa",        community:"Emerald Bay",          acres:35, lots:52, acquisitionCost:2600000, costPerLot:50000, status:"closed",         closeDate:"2025-06-10" },
  { id:4, name:"Coral Springs Expansion", city:"Orlando",      community:"Coral Springs Village",acres:18, lots:30, acquisitionCost:1350000, costPerLot:45000, status:"under-contract", closeDate:null },
  { id:5, name:"Magnolia Park Phase 2",   city:"Tampa",        community:"Magnolia Park",        acres:24, lots:40, acquisitionCost:1680000, costPerLot:42000, status:"under-contract", closeDate:null },
  { id:6, name:"Cypress Landing North",   city:"Jacksonville", community:"Cypress Landing",      acres:20, lots:35, acquisitionCost:1400000, costPerLot:40000, status:"under-contract", closeDate:null },
  { id:7, name:"Lake Nona Parcel",        city:"Orlando",      community:"Lake Nona",            acres:40, lots:65, acquisitionCost:3900000, costPerLot:60000, status:"under-contract", closeDate:null },
  { id:8, name:"Riverview Tract",         city:"Tampa",        community:"Riverview",            acres:15, lots:24, acquisitionCost:960000,  costPerLot:40000, status:"cancelled",      closeDate:null },
];

/* ─── Permits ─── */
export const permits: SHPermit[] = [
  { id:1,  jobCode:"SH-1006", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building", submittedDate:"2026-02-22", approvedDate:null,         daysInReview:30, status:"in-review" },
  { id:2,  jobCode:"SH-3004", community:"Emerald Bay",          city:"Tampa",        permitType:"Building", submittedDate:"2026-03-03", approvedDate:null,         daysInReview:21, status:"in-review" },
  { id:3,  jobCode:"SH-4005", community:"Coral Springs Village",city:"Orlando",      permitType:"Building", submittedDate:"2026-02-27", approvedDate:null,         daysInReview:25, status:"pending" },
  { id:4,  jobCode:"SH-6003", community:"Cypress Landing",      city:"Jacksonville", permitType:"Building", submittedDate:"2026-02-18", approvedDate:null,         daysInReview:34, status:"in-review" },
  { id:5,  jobCode:"SH-1001", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building", submittedDate:"2025-06-12", approvedDate:"2025-06-20", daysInReview:8,  status:"approved" },
  { id:6,  jobCode:"SH-1002", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building", submittedDate:"2025-08-22", approvedDate:"2025-09-01", daysInReview:10, status:"approved" },
  { id:7,  jobCode:"SH-2001", community:"Palm Coast Estates",   city:"Jacksonville", permitType:"Building", submittedDate:"2025-09-03", approvedDate:"2025-09-12", daysInReview:9,  status:"approved" },
  { id:8,  jobCode:"SH-3001", community:"Emerald Bay",          city:"Tampa",        permitType:"Building", submittedDate:"2025-10-17", approvedDate:"2025-10-28", daysInReview:11, status:"approved" },
  { id:9,  jobCode:"SH-4001", community:"Coral Springs Village",city:"Orlando",      permitType:"Building", submittedDate:"2025-04-05", approvedDate:"2025-04-14", daysInReview:9,  status:"approved" },
  { id:10, jobCode:"SH-5001", community:"Magnolia Park",        city:"Tampa",        permitType:"Building", submittedDate:"2025-03-05", approvedDate:"2025-03-14", daysInReview:9,  status:"approved" },
  { id:11, jobCode:"SH-6001", community:"Cypress Landing",      city:"Jacksonville", permitType:"Building", submittedDate:"2025-09-08", approvedDate:"2025-09-18", daysInReview:10, status:"approved" },
  { id:12, jobCode:"SH-1004", community:"Sunshine Ridge",       city:"Orlando",      permitType:"Building", submittedDate:"2026-01-08", approvedDate:"2026-01-18", daysInReview:10, status:"approved" },
];

/* ─── Property Management ─── */
export const propertyUnits: SHPropertyUnit[] = [
  { id:1,  address:"142 Sunshine Blvd",   community:"Sunshine Ridge",       city:"Orlando",      bedsBaths:"3/2", sqft:1983, monthlyRent:2450, marketRent:2500, occupancy:"leased",     tenant:"Rivera Family",   leaseEnd:"2026-08-31", delinquentAmount:0,    daysPastDue:0 },
  { id:2,  address:"158 Sunshine Blvd",   community:"Sunshine Ridge",       city:"Orlando",      bedsBaths:"4/2", sqft:2100, monthlyRent:2650, marketRent:2700, occupancy:"leased",     tenant:"Chen Family",     leaseEnd:"2026-11-30", delinquentAmount:0,    daysPastDue:0 },
  { id:3,  address:"204 Palm Coast Dr",   community:"Palm Coast Estates",   city:"Jacksonville", bedsBaths:"3/2", sqft:1983, monthlyRent:2200, marketRent:2250, occupancy:"leased",     tenant:"Nguyen Family",   leaseEnd:"2026-07-31", delinquentAmount:2200, daysPastDue:35 },
  { id:4,  address:"218 Palm Coast Dr",   community:"Palm Coast Estates",   city:"Jacksonville", bedsBaths:"4/3", sqft:2306, monthlyRent:2800, marketRent:2850, occupancy:"leased",     tenant:"Patel Family",    leaseEnd:"2027-01-31", delinquentAmount:0,    daysPastDue:0 },
  { id:5,  address:"312 Emerald Bay Ln",  community:"Emerald Bay",          city:"Tampa",        bedsBaths:"3/2", sqft:1983, monthlyRent:0,    marketRent:2400, occupancy:"vacant",     tenant:null,              leaseEnd:null,         delinquentAmount:0,    daysPastDue:0 },
  { id:6,  address:"326 Emerald Bay Ln",  community:"Emerald Bay",          city:"Tampa",        bedsBaths:"4/2", sqft:2100, monthlyRent:2550, marketRent:2600, occupancy:"leased",     tenant:"Brooks Family",   leaseEnd:"2026-09-30", delinquentAmount:0,    daysPastDue:0 },
  { id:7,  address:"410 Coral Springs Ct",community:"Coral Springs Village",city:"Orlando",      bedsBaths:"4/3", sqft:2306, monthlyRent:2900, marketRent:2950, occupancy:"leased",     tenant:"Kim Family",      leaseEnd:"2026-12-31", delinquentAmount:5800, daysPastDue:62 },
  { id:8,  address:"424 Coral Springs Ct",community:"Coral Springs Village",city:"Orlando",      bedsBaths:"3/2", sqft:1983, monthlyRent:2350, marketRent:2400, occupancy:"leased",     tenant:"Garcia Family",   leaseEnd:"2026-06-30", delinquentAmount:0,    daysPastDue:0 },
  { id:9,  address:"506 Magnolia Way",    community:"Magnolia Park",        city:"Tampa",        bedsBaths:"4/2", sqft:2100, monthlyRent:0,    marketRent:2500, occupancy:"make-ready", tenant:null,              leaseEnd:null,         delinquentAmount:0,    daysPastDue:0 },
  { id:10, address:"520 Magnolia Way",    community:"Magnolia Park",        city:"Tampa",        bedsBaths:"3/2", sqft:1983, monthlyRent:2300, marketRent:2350, occupancy:"leased",     tenant:"Thompson Family", leaseEnd:"2026-10-31", delinquentAmount:0,    daysPastDue:0 },
  { id:11, address:"602 Cypress Ct",      community:"Cypress Landing",      city:"Jacksonville", bedsBaths:"4/3", sqft:2306, monthlyRent:2700, marketRent:2750, occupancy:"leased",     tenant:"Morgan Family",   leaseEnd:"2026-08-31", delinquentAmount:0,    daysPastDue:0 },
  { id:12, address:"616 Cypress Ct",      community:"Cypress Landing",      city:"Jacksonville", bedsBaths:"3/2", sqft:1983, monthlyRent:2150, marketRent:2200, occupancy:"eviction",   tenant:"Wilson Family",   leaseEnd:"2026-03-31", delinquentAmount:4300, daysPastDue:90 },
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
  const avgDays = filteredPermits.length
    ? filteredPermits.reduce((s, p) => s + p.daysInReview, 0) / filteredPermits.length
    : 0;
  return { total: filteredPermits.length, approved, inReview, pending, avgDaysToApproval: avgDays };
}

export function getPMKPIs(filteredUnits: SHPropertyUnit[]) {
  const leased = filteredUnits.filter(u => u.occupancy === "leased").length;
  const total = filteredUnits.length;
  const occupancyRate = total ? (leased / total) * 100 : 0;
  const totalRent = filteredUnits.reduce((s, u) => s + u.monthlyRent, 0);
  const delinquent = filteredUnits.filter(u => u.delinquentAmount > 0).length;
  return { totalUnits: total, occupancyRate, monthlyRent: totalRent, delinquentUnits: delinquent };
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
  { bucket: "< 200d",    count: 3,  color: "#0f766e" },
  { bucket: "200–250d",  count: 8,  color: "#14b8a6" },
  { bucket: "250–300d",  count: 10, color: "#22d3ee" },
  { bucket: "300–350d",  count: 6,  color: "#3b82f6" },
  { bucket: "> 350d",    count: 3,  color: "#1e40af" },
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
    { label: "Labor",           value: 4200000, color: "#14b8a6" },
    { label: "Materials",       value: 3100000, color: "#0d9488" },
    { label: "Subcontractors",  value: 2400000, color: "#22d3ee" },
    { label: "Land & Permits",  value: 1800000, color: "#3b82f6" },
    { label: "Overhead",        value: 900000,  color: "#1e40af" },
  ];
}

/* ─── Shared Constants ─── */
export { COMMUNITIES, CITIES, ENTITIES, PLANS, SUPERS, STAGES, LENDERS, COMM_META };
