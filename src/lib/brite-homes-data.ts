/* ── Brite Homes Demo Data ──
   Static mock data for the Brite Homes dashboard demo.
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
const COMMUNITIES = ["Brite Ridge", "Brite Coast", "Brite Bay", "Brite Springs", "Brite Park", "Brite Landing"] as const;
export const CITIES = ["Miami", "Tampa", "Jacksonville"] as const;
export const ENTITIES = ["Brite Homes Inc", "Brite Homes Florida LLC"] as const;
const PLANS = ["Ocean 2100", "Marina 2400", "Skyline 2600"] as const;
const SUPERS = ["John Smith", "Maria Garcia", "Carlos Rodriguez", "Patricia Lee"] as const;
export const STAGES = ["Permit", "Foundation", "Framing", "MEP / Drywall", "Finishes", "Closing"] as const;
const LENDERS = ["First Miami Bank", "Florida Construction Credit", "Ocean Capital Partners", "Tampa Bay Finance", "Eastern Developers Bank"] as const;

/* Community → city/entity mapping */
const COMM_META: Record<string, { city: string; entity: string }> = {
  "Brite Ridge":        { city: "Miami",       entity: "Brite Homes Inc" },
  "Brite Coast":        { city: "Jacksonville", entity: "Brite Homes Florida LLC" },
  "Brite Bay":          { city: "Tampa",       entity: "Brite Homes Inc" },
  "Brite Springs":      { city: "Miami",       entity: "Brite Homes Inc" },
  "Brite Park":         { city: "Tampa",       entity: "Brite Homes Florida LLC" },
  "Brite Landing":      { city: "Jacksonville", entity: "Brite Homes Florida LLC" },
};

/* ─── Jobs (30 total) ─── */
export const jobs: SHJob[] = [
  /* Brite Ridge – Miami (6 jobs) */
  { id:1,  jobCode:"BH-1001", lot:"Lot 14",  community:"Brite Ridge",       city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Ocean 2100",    superintendent:"John Smith",    jobType:"Construction", stage:"Finishes",       completionPct:88, startDate:"2025-06-10", estCompletion:"2026-04-15", contractValue:485000, estimatedCost:362000, actualCostToDate:318000, wipBalance:318000, lotCost:52000, originalBudget:370000, projectedFinalCost:368000, margin:117000, marginPct:24.1, daysInCurrentPhase:18, totalCycleDays:280, permittingBudget:15832, permittingActual:14328, sidewalkBudget:25253, sidewalkActual:24247, verticalBudget:193749, verticalActual:197857, permitDate:"2025-06-20", foundationDate:"2025-07-25", framingDate:"2025-09-10", mepDate:"2025-11-05", drywallDate:"2025-12-20", finishesDate:"2026-02-15", coDate:null, closingDate:null },
  { id:2,  jobCode:"BH-1002", lot:"Lot 15",  community:"Brite Ridge",       city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Marina 2400",   superintendent:"John Smith",    jobType:"Construction", stage:"MEP / Drywall", completionPct:62, startDate:"2025-08-20", estCompletion:"2026-06-10", contractValue:520000, estimatedCost:388000, actualCostToDate:240000, wipBalance:240000, lotCost:52000, originalBudget:395000, projectedFinalCost:392000, margin:128000, marginPct:24.6, daysInCurrentPhase:32, totalCycleDays:210, permittingBudget:18898, permittingActual:17337, sidewalkBudget:28700, sidewalkActual:26558, verticalBudget:186386, verticalActual:186506, permitDate:"2025-09-01", foundationDate:"2025-10-05", framingDate:"2025-11-20", mepDate:"2026-01-15", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:3,  jobCode:"BH-1003", lot:"Lot 22",  community:"Brite Ridge",       city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Skyline 2600",  superintendent:"Maria Garcia",  jobType:"Construction", stage:"Framing",        completionPct:35, startDate:"2025-11-01", estCompletion:"2026-08-20", contractValue:565000, estimatedCost:422000, actualCostToDate:148000, wipBalance:148000, lotCost:52000, originalBudget:430000, projectedFinalCost:428000, margin:137000, marginPct:24.2, daysInCurrentPhase:22, totalCycleDays:140, permittingBudget:13128, permittingActual:12337, sidewalkBudget:34184, sidewalkActual:34802, verticalBudget:202979, verticalActual:205153, permitDate:"2025-11-15", foundationDate:"2025-12-20", framingDate:"2026-02-01", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:4,  jobCode:"BH-1004", lot:"Lot 23",  community:"Brite Ridge",       city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Ocean 2100",    superintendent:"Maria Garcia",  jobType:"Construction", stage:"Foundation",     completionPct:15, startDate:"2026-01-05", estCompletion:"2026-10-15", contractValue:490000, estimatedCost:365000, actualCostToDate:55000,  wipBalance:55000,  lotCost:52000, originalBudget:372000, projectedFinalCost:370000, margin:120000, marginPct:24.5, daysInCurrentPhase:14, totalCycleDays:78, permittingBudget:17182, permittingActual:15486, sidewalkBudget:31313, sidewalkActual:32743, verticalBudget:180057, verticalActual:172613,  permitDate:"2026-01-18", foundationDate:"2026-02-20", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:5,  jobCode:"BH-1005", lot:"Lot 30",  community:"Brite Ridge",       city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Marina 2400",   superintendent:"John Smith",    jobType:"Completed", stage:"Closing",        completionPct:98, startDate:"2025-03-15", estCompletion:"2026-03-28", contractValue:525000, estimatedCost:390000, actualCostToDate:388000, wipBalance:388000, lotCost:52000, originalBudget:398000, projectedFinalCost:393000, margin:132000, marginPct:25.1, daysInCurrentPhase:8,  totalCycleDays:365, permittingBudget:19559, permittingActual:18920, sidewalkBudget:24987, sidewalkActual:23423, verticalBudget:212830, verticalActual:215479, permitDate:"2025-03-28", foundationDate:"2025-05-10", framingDate:"2025-07-05", mepDate:"2025-09-01", drywallDate:"2025-10-20", finishesDate:"2025-12-15", coDate:"2026-03-10", closingDate:null },
  { id:6,  jobCode:"BH-1006", lot:"Lot 31",  community:"Brite Ridge",       city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Skyline 2600",  superintendent:"John Smith",    jobType:"Permitting", stage:"Permit",         completionPct:5,  startDate:"2026-02-20", estCompletion:"2026-12-01", contractValue:570000, estimatedCost:425000, actualCostToDate:12000,  wipBalance:12000,  lotCost:52000, originalBudget:432000, projectedFinalCost:430000, margin:140000, marginPct:24.6, daysInCurrentPhase:32, totalCycleDays:32, permittingBudget:19934, permittingActual:20850, sidewalkBudget:32870, sidewalkActual:35998, verticalBudget:210753, verticalActual:212069,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Brite Coast – Jacksonville (5 jobs) */
  { id:7,  jobCode:"BH-2001", lot:"Lot 3",   community:"Brite Coast",       city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Marina 2400",   superintendent:"Carlos Rodriguez", jobType:"Construction", stage:"MEP / Drywall", completionPct:58, startDate:"2025-09-01", estCompletion:"2026-06-20", contractValue:445000, estimatedCost:332000, actualCostToDate:192000, wipBalance:192000, lotCost:38000, originalBudget:340000, projectedFinalCost:338000, margin:107000, marginPct:24.0, daysInCurrentPhase:28, totalCycleDays:200, permittingBudget:15840, permittingActual:16215, sidewalkBudget:29189, sidewalkActual:29887, verticalBudget:176955, verticalActual:167311, permitDate:"2025-09-12", foundationDate:"2025-10-18", framingDate:"2025-12-02", mepDate:"2026-01-20", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:8,  jobCode:"BH-2002", lot:"Lot 4",   community:"Brite Coast",       city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Ocean 2100",    superintendent:"Carlos Rodriguez", jobType:"Construction", stage:"Framing",        completionPct:32, startDate:"2025-11-10", estCompletion:"2026-08-28", contractValue:410000, estimatedCost:306000, actualCostToDate:98000,  wipBalance:98000,  lotCost:38000, originalBudget:312000, projectedFinalCost:310000, margin:100000, marginPct:24.4, daysInCurrentPhase:18, totalCycleDays:134, permittingBudget:10782, permittingActual:10328, sidewalkBudget:19467, sidewalkActual:18725, verticalBudget:143551, verticalActual:139726, permitDate:"2025-11-22", foundationDate:"2026-01-05", framingDate:"2026-02-10", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:9,  jobCode:"BH-2003", lot:"Lot 8",   community:"Brite Coast",       city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Skyline 2600",  superintendent:"Patricia Lee",    jobType:"Construction", stage:"Finishes",       completionPct:82, startDate:"2025-07-05", estCompletion:"2026-04-25", contractValue:498000, estimatedCost:372000, actualCostToDate:305000, wipBalance:305000, lotCost:38000, originalBudget:380000, projectedFinalCost:376000, margin:122000, marginPct:24.5, daysInCurrentPhase:25, totalCycleDays:258, permittingBudget:16231, permittingActual:15792, sidewalkBudget:27020, sidewalkActual:25877, verticalBudget:181145, verticalActual:190637, permitDate:"2025-07-18", foundationDate:"2025-08-22", framingDate:"2025-10-10", mepDate:"2025-12-05", drywallDate:"2026-01-15", finishesDate:"2026-02-20", coDate:null, closingDate:null },
  { id:10, jobCode:"BH-2004", lot:"Lot 11",  community:"Brite Coast",       city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Marina 2400",   superintendent:"Carlos Rodriguez", jobType:"Construction", stage:"Foundation",     completionPct:12, startDate:"2026-01-15", estCompletion:"2026-10-28", contractValue:450000, estimatedCost:336000, actualCostToDate:40000,  wipBalance:40000,  lotCost:38000, originalBudget:342000, projectedFinalCost:340000, margin:110000, marginPct:24.4, daysInCurrentPhase:10, totalCycleDays:68, permittingBudget:14693, permittingActual:15014, sidewalkBudget:22276, sidewalkActual:23417, verticalBudget:159488, verticalActual:157181,  permitDate:"2026-01-28", foundationDate:"2026-03-01", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:11, jobCode:"BH-2005", lot:"Lot 12",  community:"Brite Coast",       city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Ocean 2100",    superintendent:"Patricia Lee",    jobType:"Completed", stage:"Closing",        completionPct:96, startDate:"2025-04-20", estCompletion:"2026-03-30", contractValue:415000, estimatedCost:310000, actualCostToDate:308000, wipBalance:308000, lotCost:38000, originalBudget:316000, projectedFinalCost:312000, margin:103000, marginPct:24.8, daysInCurrentPhase:5,  totalCycleDays:335, permittingBudget:15734, permittingActual:16175, sidewalkBudget:24240, sidewalkActual:25288, verticalBudget:168834, verticalActual:174426, permitDate:"2025-05-02", foundationDate:"2025-06-15", framingDate:"2025-08-10", mepDate:"2025-10-05", drywallDate:"2025-11-18", finishesDate:"2026-01-10", coDate:"2026-03-15", closingDate:null },

  /* Brite Bay – Tampa (5 jobs) */
  { id:12, jobCode:"BH-3001", lot:"Lot 7",   community:"Brite Bay",         city:"Tampa", county:"Hillsborough", entity:"Brite Homes Inc",        plan:"Skyline 2600",  superintendent:"Maria Garcia",  jobType:"Construction", stage:"Framing",        completionPct:38, startDate:"2025-10-15", estCompletion:"2026-08-05", contractValue:545000, estimatedCost:407000, actualCostToDate:155000, wipBalance:155000, lotCost:48000, originalBudget:415000, projectedFinalCost:412000, margin:133000, marginPct:24.4, daysInCurrentPhase:20, totalCycleDays:160, permittingBudget:14351, permittingActual:13008, sidewalkBudget:28827, sidewalkActual:27910, verticalBudget:195506, verticalActual:205897, permitDate:"2025-10-28", foundationDate:"2025-12-05", framingDate:"2026-01-18", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:13, jobCode:"BH-3002", lot:"Lot 9",   community:"Brite Bay",         city:"Tampa", county:"Hillsborough", entity:"Brite Homes Inc",        plan:"Ocean 2100",    superintendent:"Maria Garcia",  jobType:"Construction", stage:"Finishes",       completionPct:85, startDate:"2025-06-25", estCompletion:"2026-04-20", contractValue:475000, estimatedCost:355000, actualCostToDate:302000, wipBalance:302000, lotCost:48000, originalBudget:362000, projectedFinalCost:358000, margin:117000, marginPct:24.6, daysInCurrentPhase:22, totalCycleDays:268, permittingBudget:17205, permittingActual:16567, sidewalkBudget:28838, sidewalkActual:28585, verticalBudget:196007, verticalActual:195039, permitDate:"2025-07-08", foundationDate:"2025-08-15", framingDate:"2025-10-01", mepDate:"2025-11-28", drywallDate:"2026-01-10", finishesDate:"2026-02-18", coDate:null, closingDate:null },
  { id:14, jobCode:"BH-3003", lot:"Lot 16",  community:"Brite Bay",         city:"Tampa", county:"Hillsborough", entity:"Brite Homes Inc",        plan:"Marina 2400",   superintendent:"John Smith",    jobType:"Construction", stage:"MEP / Drywall", completionPct:55, startDate:"2025-09-10", estCompletion:"2026-06-28", contractValue:510000, estimatedCost:380000, actualCostToDate:209000, wipBalance:209000, lotCost:48000, originalBudget:388000, projectedFinalCost:385000, margin:125000, marginPct:24.5, daysInCurrentPhase:30, totalCycleDays:195, permittingBudget:13695, permittingActual:13001, sidewalkBudget:29814, sidewalkActual:28839, verticalBudget:197282, verticalActual:206700, permitDate:"2025-09-22", foundationDate:"2025-10-28", framingDate:"2025-12-15", mepDate:"2026-02-01", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:15, jobCode:"BH-3004", lot:"Lot 20",  community:"Brite Bay",         city:"Tampa", county:"Hillsborough", entity:"Brite Homes Inc",        plan:"Skyline 2600",  superintendent:"Maria Garcia",  jobType:"Permitting", stage:"Permit",         completionPct:3,  startDate:"2026-03-01", estCompletion:"2026-12-15", contractValue:550000, estimatedCost:410000, actualCostToDate:8000,   wipBalance:8000,   lotCost:48000, originalBudget:418000, projectedFinalCost:415000, margin:135000, marginPct:24.5, daysInCurrentPhase:23, totalCycleDays:23, permittingBudget:15879, permittingActual:14988, sidewalkBudget:37589, sidewalkActual:38029, verticalBudget:191900, verticalActual:181471,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:16, jobCode:"BH-3005", lot:"Lot 21",  community:"Brite Bay",         city:"Tampa", county:"Hillsborough", entity:"Brite Homes Inc",        plan:"Ocean 2100",    superintendent:"John Smith",    jobType:"Construction", stage:"Foundation",     completionPct:18, startDate:"2025-12-20", estCompletion:"2026-09-30", contractValue:480000, estimatedCost:358000, actualCostToDate:64000,  wipBalance:64000,  lotCost:48000, originalBudget:365000, projectedFinalCost:362000, margin:118000, marginPct:24.6, daysInCurrentPhase:12, totalCycleDays:94, permittingBudget:11750, permittingActual:12049, sidewalkBudget:30573, sidewalkActual:30450, verticalBudget:166569, verticalActual:164203,  permitDate:"2026-01-05", foundationDate:"2026-02-10", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Brite Springs – Miami (5 jobs) */
  { id:17, jobCode:"BH-4001", lot:"Lot 2",   community:"Brite Springs",     city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Marina 2400",   superintendent:"Patricia Lee",  jobType:"Completed", stage:"Closing",        completionPct:97, startDate:"2025-04-01", estCompletion:"2026-03-25", contractValue:505000, estimatedCost:376000, actualCostToDate:374000, wipBalance:374000, lotCost:45000, originalBudget:382000, projectedFinalCost:378000, margin:127000, marginPct:25.1, daysInCurrentPhase:6,  totalCycleDays:355, permittingBudget:19070, permittingActual:19181, sidewalkBudget:34049, sidewalkActual:36601, verticalBudget:172339, verticalActual:176904, permitDate:"2025-04-14", foundationDate:"2025-05-28", framingDate:"2025-07-22", mepDate:"2025-09-18", drywallDate:"2025-11-02", finishesDate:"2026-01-05", coDate:"2026-03-08", closingDate:null },
  { id:18, jobCode:"BH-4002", lot:"Lot 5",   community:"Brite Springs",     city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Skyline 2600",  superintendent:"Patricia Lee",  jobType:"Construction", stage:"Finishes",       completionPct:80, startDate:"2025-07-15", estCompletion:"2026-05-05", contractValue:555000, estimatedCost:414000, actualCostToDate:331000, wipBalance:331000, lotCost:45000, originalBudget:422000, projectedFinalCost:418000, margin:137000, marginPct:24.7, daysInCurrentPhase:20, totalCycleDays:250, permittingBudget:18414, permittingActual:18550, sidewalkBudget:28698, sidewalkActual:29713, verticalBudget:194608, verticalActual:193085, permitDate:"2025-07-28", foundationDate:"2025-09-02", framingDate:"2025-10-20", mepDate:"2025-12-15", drywallDate:"2026-01-28", finishesDate:"2026-03-01", coDate:null, closingDate:null },
  { id:19, jobCode:"BH-4003", lot:"Lot 10",  community:"Brite Springs",     city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Ocean 2100",    superintendent:"Carlos Rodriguez", jobType:"Construction", stage:"MEP / Drywall", completionPct:60, startDate:"2025-08-28", estCompletion:"2026-06-15", contractValue:478000, estimatedCost:356000, actualCostToDate:214000, wipBalance:214000, lotCost:45000, originalBudget:364000, projectedFinalCost:360000, margin:118000, marginPct:24.7, daysInCurrentPhase:26, totalCycleDays:205, permittingBudget:14223, permittingActual:15514, sidewalkBudget:31404, sidewalkActual:30381, verticalBudget:182021, verticalActual:175002, permitDate:"2025-09-10", foundationDate:"2025-10-15", framingDate:"2025-12-01", mepDate:"2026-01-22", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:20, jobCode:"BH-4004", lot:"Lot 17",  community:"Brite Springs",     city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Marina 2400",   superintendent:"Carlos Rodriguez", jobType:"Construction", stage:"Framing",        completionPct:30, startDate:"2025-11-20", estCompletion:"2026-09-05", contractValue:508000, estimatedCost:378000, actualCostToDate:113000, wipBalance:113000, lotCost:45000, originalBudget:386000, projectedFinalCost:382000, margin:126000, marginPct:24.8, daysInCurrentPhase:15, totalCycleDays:124, permittingBudget:18625, permittingActual:20005, sidewalkBudget:26616, sidewalkActual:27548, verticalBudget:197206, verticalActual:188991, permitDate:"2025-12-05", foundationDate:"2026-01-10", framingDate:"2026-02-15", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:21, jobCode:"BH-4005", lot:"Lot 18",  community:"Brite Springs",     city:"Miami", county:"Miami-Dade", entity:"Brite Homes Inc",        plan:"Skyline 2600",  superintendent:"Patricia Lee",  jobType:"Permitting", stage:"Permit",         completionPct:4,  startDate:"2026-02-25", estCompletion:"2026-12-10", contractValue:560000, estimatedCost:418000, actualCostToDate:10000,  wipBalance:10000,  lotCost:45000, originalBudget:426000, projectedFinalCost:422000, margin:138000, marginPct:24.6, daysInCurrentPhase:27, totalCycleDays:27, permittingBudget:19277, permittingActual:19429, sidewalkBudget:35511, sidewalkActual:36060, verticalBudget:191724, verticalActual:187678,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Brite Park – Tampa (5 jobs) */
  { id:22, jobCode:"BH-5001", lot:"Lot 1",   community:"Brite Park",        city:"Tampa", county:"Hillsborough", entity:"Brite Homes Florida LLC", plan:"Ocean 2100",    superintendent:"John Smith",    jobType:"Completed", stage:"Closing",        completionPct:99, startDate:"2025-03-01", estCompletion:"2026-03-20", contractValue:462000, estimatedCost:345000, actualCostToDate:343000, wipBalance:343000, lotCost:42000, originalBudget:352000, projectedFinalCost:348000, margin:114000, marginPct:24.7, daysInCurrentPhase:4,  totalCycleDays:380, permittingBudget:10697, permittingActual:11615, sidewalkBudget:30399, sidewalkActual:32518, verticalBudget:169224, verticalActual:160247, permitDate:"2025-03-14", foundationDate:"2025-04-28", framingDate:"2025-06-22", mepDate:"2025-08-18", drywallDate:"2025-10-01", finishesDate:"2025-12-02", coDate:"2026-03-05", closingDate:null },
  { id:23, jobCode:"BH-5002", lot:"Lot 6",   community:"Brite Park",        city:"Tampa", county:"Hillsborough", entity:"Brite Homes Florida LLC", plan:"Marina 2400",   superintendent:"Maria Garcia",  jobType:"Construction", stage:"Finishes",       completionPct:78, startDate:"2025-07-20", estCompletion:"2026-05-10", contractValue:498000, estimatedCost:372000, actualCostToDate:290000, wipBalance:290000, lotCost:42000, originalBudget:380000, projectedFinalCost:376000, margin:122000, marginPct:24.5, daysInCurrentPhase:16, totalCycleDays:245, permittingBudget:18073, permittingActual:19689, sidewalkBudget:23776, sidewalkActual:23954, verticalBudget:173630, verticalActual:179060, permitDate:"2025-08-02", foundationDate:"2025-09-08", framingDate:"2025-10-25", mepDate:"2025-12-20", drywallDate:"2026-02-01", finishesDate:"2026-03-05", coDate:null, closingDate:null },
  { id:24, jobCode:"BH-5003", lot:"Lot 13",  community:"Brite Park",        city:"Tampa", county:"Hillsborough", entity:"Brite Homes Florida LLC", plan:"Skyline 2600",  superintendent:"Maria Garcia",  jobType:"Construction", stage:"Framing",        completionPct:33, startDate:"2025-11-05", estCompletion:"2026-08-15", contractValue:535000, estimatedCost:399000, actualCostToDate:132000, wipBalance:132000, lotCost:42000, originalBudget:406000, projectedFinalCost:404000, margin:131000, marginPct:24.5, daysInCurrentPhase:19, totalCycleDays:139, permittingBudget:18399, permittingActual:17032, sidewalkBudget:30149, sidewalkActual:30721, verticalBudget:193461, verticalActual:202107, permitDate:"2025-11-18", foundationDate:"2025-12-22", framingDate:"2026-02-05", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:25, jobCode:"BH-5004", lot:"Lot 19",  community:"Brite Park",        city:"Tampa", county:"Hillsborough", entity:"Brite Homes Florida LLC", plan:"Ocean 2100",    superintendent:"John Smith",    jobType:"Construction", stage:"Foundation",     completionPct:14, startDate:"2026-01-10", estCompletion:"2026-10-20", contractValue:468000, estimatedCost:349000, actualCostToDate:49000,  wipBalance:49000,  lotCost:42000, originalBudget:356000, projectedFinalCost:353000, margin:115000, marginPct:24.6, daysInCurrentPhase:11, totalCycleDays:73, permittingBudget:13693, permittingActual:12904, sidewalkBudget:27120, sidewalkActual:28514, verticalBudget:167361, verticalActual:163580,  permitDate:"2026-01-22", foundationDate:"2026-02-25", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:26, jobCode:"BH-5005", lot:"Lot 24",  community:"Brite Park",        city:"Tampa", county:"Hillsborough", entity:"Brite Homes Florida LLC", plan:"Marina 2400",   superintendent:"Maria Garcia",  jobType:"Construction", stage:"MEP / Drywall", completionPct:52, startDate:"2025-09-18", estCompletion:"2026-07-05", contractValue:502000, estimatedCost:374000, actualCostToDate:195000, wipBalance:195000, lotCost:42000, originalBudget:382000, projectedFinalCost:378000, margin:124000, marginPct:24.7, daysInCurrentPhase:24, totalCycleDays:188, permittingBudget:19063, permittingActual:19634, sidewalkBudget:27941, sidewalkActual:28309, verticalBudget:176522, verticalActual:170690, permitDate:"2025-10-01", foundationDate:"2025-11-05", framingDate:"2025-12-20", mepDate:"2026-02-08", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },

  /* Brite Landing – Jacksonville (4 jobs) */
  { id:27, jobCode:"BH-6001", lot:"Lot 25",  community:"Brite Landing",     city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Skyline 2600",  superintendent:"Carlos Rodriguez", jobType:"Construction", stage:"MEP / Drywall", completionPct:56, startDate:"2025-09-05", estCompletion:"2026-06-25", contractValue:542000, estimatedCost:404000, actualCostToDate:226000, wipBalance:226000, lotCost:40000, originalBudget:412000, projectedFinalCost:408000, margin:134000, marginPct:24.7, daysInCurrentPhase:29, totalCycleDays:198, permittingBudget:15146, permittingActual:15414, sidewalkBudget:27564, sidewalkActual:26451, verticalBudget:188325, verticalActual:191288, permitDate:"2025-09-18", foundationDate:"2025-10-22", framingDate:"2025-12-08", mepDate:"2026-01-25", drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:28, jobCode:"BH-6002", lot:"Lot 26",  community:"Brite Landing",     city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Ocean 2100",    superintendent:"Patricia Lee",    jobType:"Construction", stage:"Framing",        completionPct:28, startDate:"2025-12-01", estCompletion:"2026-09-12", contractValue:458000, estimatedCost:342000, actualCostToDate:96000,  wipBalance:96000,  lotCost:40000, originalBudget:348000, projectedFinalCost:346000, margin:112000, marginPct:24.5, daysInCurrentPhase:16, totalCycleDays:113, permittingBudget:12033, permittingActual:13009, sidewalkBudget:29855, sidewalkActual:27847, verticalBudget:164883, verticalActual:168226, permitDate:"2025-12-14", foundationDate:"2026-01-18", framingDate:"2026-03-01", mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:29, jobCode:"BH-6003", lot:"Lot 27",  community:"Brite Landing",     city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Marina 2400",   superintendent:"Carlos Rodriguez", jobType:"Permitting", stage:"Permit",         completionPct:6,  startDate:"2026-02-15", estCompletion:"2026-11-25", contractValue:465000, estimatedCost:347000, actualCostToDate:14000,  wipBalance:14000,  lotCost:40000, originalBudget:354000, projectedFinalCost:350000, margin:115000, marginPct:24.7, daysInCurrentPhase:37, totalCycleDays:37, permittingBudget:12137, permittingActual:11244, sidewalkBudget:31175, sidewalkActual:31885, verticalBudget:176033, verticalActual:182045,  permitDate:null, foundationDate:null, framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
  { id:30, jobCode:"BH-6004", lot:"Lot 28",  community:"Brite Landing",     city:"Jacksonville", county:"Duval", entity:"Brite Homes Florida LLC", plan:"Skyline 2600",  superintendent:"Patricia Lee",    jobType:"Construction", stage:"Foundation",     completionPct:10, startDate:"2026-01-20", estCompletion:"2026-10-30", contractValue:548000, estimatedCost:408000, actualCostToDate:41000,  wipBalance:41000,  lotCost:40000, originalBudget:416000, projectedFinalCost:412000, margin:136000, marginPct:24.8, daysInCurrentPhase:8,  totalCycleDays:63, permittingBudget:19198, permittingActual:18009, sidewalkBudget:26170, sidewalkActual:26107, verticalBudget:204821, verticalActual:204011,  permitDate:"2026-02-02", foundationDate:"2026-03-08", framingDate:null, mepDate:null, drywallDate:null, finishesDate:null, coDate:null, closingDate:null },
];

/* ─── Sales ─── */
export const sales: SHSale[] = [
  { id:1,  jobCode:"BH-1001", community:"Brite Ridge",    city:"Miami",        entity:"Brite Homes Inc",        plan:"Ocean 2100",    buyer:"Johnson Family",   agent:"Maria Santos",  salePrice:485000, contractDate:"2025-05-20", closingDate:null,         status:"active" },
  { id:2,  jobCode:"BH-1002", community:"Brite Ridge",    city:"Miami",        entity:"Brite Homes Inc",        plan:"Marina 2400",   buyer:"Martinez Family",  agent:"James Wilson",  salePrice:520000, contractDate:"2025-07-15", closingDate:null,         status:"active" },
  { id:3,  jobCode:"BH-1003", community:"Brite Ridge",    city:"Miami",        entity:"Brite Homes Inc",        plan:"Skyline 2600",  buyer:"Williams Family",  agent:"David Kim",     salePrice:565000, contractDate:"2025-10-10", closingDate:null,         status:"active" },
  { id:4,  jobCode:"BH-1005", community:"Brite Ridge",    city:"Miami",        entity:"Brite Homes Inc",        plan:"Marina 2400",   buyer:"Davis Family",     agent:"Sarah Chen",    salePrice:525000, contractDate:"2025-02-28", closingDate:"2026-03-28", status:"pending" },
  { id:5,  jobCode:"BH-2001", community:"Brite Coast",    city:"Jacksonville", entity:"Brite Homes Florida LLC", plan:"Marina 2400",   buyer:"Brown Family",     agent:"Maria Santos",  salePrice:445000, contractDate:"2025-08-12", closingDate:null,         status:"active" },
  { id:6,  jobCode:"BH-2003", community:"Brite Coast",    city:"Jacksonville", entity:"Brite Homes Florida LLC", plan:"Skyline 2600",  buyer:"Taylor Family",    agent:"James Wilson",  salePrice:498000, contractDate:"2025-06-18", closingDate:null,         status:"active" },
  { id:7,  jobCode:"BH-2005", community:"Brite Coast",    city:"Jacksonville", entity:"Brite Homes Florida LLC", plan:"Ocean 2100",    buyer:"Anderson Family",  agent:"David Kim",     salePrice:415000, contractDate:"2025-03-30", closingDate:"2026-03-30", status:"pending" },
  { id:8,  jobCode:"BH-3001", community:"Brite Bay",      city:"Tampa",        entity:"Brite Homes Inc",        plan:"Skyline 2600",  buyer:"Thomas Family",    agent:"Sarah Chen",    salePrice:545000, contractDate:"2025-09-25", closingDate:null,         status:"active" },
  { id:9,  jobCode:"BH-3002", community:"Brite Bay",      city:"Tampa",        entity:"Brite Homes Inc",        plan:"Ocean 2100",    buyer:"Jackson Family",   agent:"Maria Santos",  salePrice:475000, contractDate:"2025-06-05", closingDate:null,         status:"active" },
  { id:10, jobCode:"BH-3003", community:"Brite Bay",      city:"Tampa",        entity:"Brite Homes Inc",        plan:"Marina 2400",   buyer:"White Family",     agent:"James Wilson",  salePrice:510000, contractDate:"2025-08-20", closingDate:null,         status:"active" },
  { id:11, jobCode:"BH-4001", community:"Brite Springs",  city:"Miami",        entity:"Brite Homes Inc",        plan:"Marina 2400",   buyer:"Harris Family",    agent:"David Kim",     salePrice:505000, contractDate:"2025-03-15", closingDate:"2026-03-25", status:"pending" },
  { id:12, jobCode:"BH-4002", community:"Brite Springs",  city:"Miami",        entity:"Brite Homes Inc",        plan:"Skyline 2600",  buyer:"Moore Family",     agent:"Sarah Chen",    salePrice:555000, contractDate:"2025-06-10", closingDate:null,         status:"active" },
  { id:13, jobCode:"BH-5001", community:"Brite Park",     city:"Tampa",        entity:"Brite Homes Florida LLC", plan:"Ocean 2100",    buyer:"Clark Family",     agent:"Maria Santos",  salePrice:462000, contractDate:"2025-02-20", closingDate:"2026-03-20", status:"pending" },
  { id:14, jobCode:"BH-5002", community:"Brite Park",     city:"Tampa",        entity:"Brite Homes Florida LLC", plan:"Marina 2400",   buyer:"Lewis Family",     agent:"James Wilson",  salePrice:498000, contractDate:"2025-07-08", closingDate:null,         status:"active" },
  { id:15, jobCode:"BH-6001", community:"Brite Landing",  city:"Jacksonville", entity:"Brite Homes Florida LLC", plan:"Skyline 2600",  buyer:"Walker Family",    agent:"David Kim",     salePrice:542000, contractDate:"2025-08-30", closingDate:null,         status:"active" },
];

/* ─── Loans ─── */
export const loans: SHLoan[] = [
  { id:1, jobCode:"BH-1001", community:"Brite Ridge", city:"Miami", lender:"First Miami Bank", loanAmount:350000, totalDrawn:315000, drawPct:90.0, interestRate:6.25, expirationDate:"2026-04-15", daysUntilExpiration:22 },
  { id:2, jobCode:"BH-1002", community:"Brite Ridge", city:"Miami", lender:"Florida Construction Credit", loanAmount:380000, totalDrawn:240000, drawPct:63.2, interestRate:6.50, expirationDate:"2026-06-10", daysUntilExpiration:78 },
  { id:3, jobCode:"BH-1003", community:"Brite Ridge", city:"Miami", lender:"Ocean Capital Partners", loanAmount:410000, totalDrawn:148000, drawPct:36.1, interestRate:6.75, expirationDate:"2026-08-20", daysUntilExpiration:149 },
  { id:4, jobCode:"BH-2001", community:"Brite Coast", city:"Jacksonville", lender:"Tampa Bay Finance", loanAmount:320000, totalDrawn:192000, drawPct:60.0, interestRate:6.40, expirationDate:"2026-06-20", daysUntilExpiration:88 },
  { id:5, jobCode:"BH-2003", community:"Brite Coast", city:"Jacksonville", lender:"Eastern Developers Bank", loanAmount:340000, totalDrawn:305000, drawPct:89.7, interestRate:6.30, expirationDate:"2026-04-25", daysUntilExpiration:32 },
  { id:6, jobCode:"BH-3001", community:"Brite Bay", city:"Tampa", lender:"First Miami Bank", loanAmount:395000, totalDrawn:155000, drawPct:39.2, interestRate:6.20, expirationDate:"2026-08-05", daysUntilExpiration:134 },
  { id:7, jobCode:"BH-3002", community:"Brite Bay", city:"Tampa", lender:"Florida Construction Credit", loanAmount:325000, totalDrawn:302000, drawPct:92.9, interestRate:6.55, expirationDate:"2026-04-20", daysUntilExpiration:27 },
  { id:8, jobCode:"BH-3003", community:"Brite Bay", city:"Tampa", lender:"Ocean Capital Partners", loanAmount:370000, totalDrawn:209000, drawPct:56.5, interestRate:6.70, expirationDate:"2026-06-28", daysUntilExpiration:96 },
  { id:9, jobCode:"BH-4001", community:"Brite Springs", city:"Miami", lender:"Tampa Bay Finance", loanAmount:365000, totalDrawn:374000, drawPct:102.5, interestRate:6.35, expirationDate:"2026-03-25", daysUntilExpiration:1 },
  { id:10, jobCode:"BH-4002", community:"Brite Springs", city:"Miami", lender:"Eastern Developers Bank", loanAmount:375000, totalDrawn:331000, drawPct:88.3, interestRate:6.45, expirationDate:"2026-05-05", daysUntilExpiration:42 },
  { id:11, jobCode:"BH-5001", community:"Brite Park", city:"Tampa", lender:"First Miami Bank", loanAmount:315000, totalDrawn:343000, drawPct:108.9, interestRate:6.15, expirationDate:"2026-03-20", daysUntilExpiration:-4 },
  { id:12, jobCode:"BH-5002", community:"Brite Park", city:"Tampa", lender:"Florida Construction Credit", loanAmount:340000, totalDrawn:290000, drawPct:85.3, interestRate:6.48, expirationDate:"2026-05-10", daysUntilExpiration:47 },
  { id:13, jobCode:"BH-6001", community:"Brite Landing", city:"Jacksonville", lender:"Ocean Capital Partners", loanAmount:390000, totalDrawn:226000, drawPct:57.9, interestRate:6.65, expirationDate:"2026-06-25", daysUntilExpiration:93 },
  { id:14, jobCode:"BH-6002", community:"Brite Landing", city:"Jacksonville", lender:"Tampa Bay Finance", loanAmount:310000, totalDrawn:96000, drawPct:31.0, interestRate:6.38, expirationDate:"2026-09-12", daysUntilExpiration:172 },
  { id:15, jobCode:"BH-6004", community:"Brite Landing", city:"Jacksonville", lender:"Eastern Developers Bank", loanAmount:370000, totalDrawn:41000, drawPct:11.1, interestRate:6.42, expirationDate:"2026-10-30", daysUntilExpiration:220 },
];

/* ─── Land Deals ─── */
export const landDeals: SHLandDeal[] = [
  { id:1, name:"LAND-001", community:"Brite Ridge",    city:"Miami",        county:"Miami-Dade",    acres:30, lots:25, acquisitionCost:1200000, costPerLot:48000, status:"under-contract", closeDate:null, contractDate:"2025-06-01", year:2025 },
  { id:2, name:"LAND-002", community:"Brite Coast",    city:"Jacksonville", county:"Duval",         acres:35, lots:30, acquisitionCost:1400000, costPerLot:46667, status:"under-contract", closeDate:null, contractDate:"2025-06-01", year:2025 },
  { id:3, name:"LAND-003", community:"Brite Bay",      city:"Tampa",        county:"Hillsborough",  acres:32, lots:28, acquisitionCost:1350000, costPerLot:48214, status:"under-contract", closeDate:null, contractDate:"2025-06-01", year:2025 },
  { id:4, name:"LAND-004", community:"Brite Springs",  city:"Miami",        county:"Miami-Dade",    acres:25, lots:22, acquisitionCost:1100000, costPerLot:50000, status:"under-contract", closeDate:null, contractDate:"2025-06-01", year:2025 },
  { id:5, name:"LAND-005", community:"Brite Park",     city:"Tampa",        county:"Hillsborough",  acres:28, lots:26, acquisitionCost:1300000, costPerLot:50000, status:"under-contract", closeDate:null, contractDate:"2025-06-01", year:2025 },
  { id:6, name:"LAND-006", community:"Brite Landing",  city:"Jacksonville", county:"Duval",         acres:27, lots:24, acquisitionCost:1250000, costPerLot:52083, status:"under-contract", closeDate:null, contractDate:"2025-06-01", year:2025 },
];

/* ─── Permits ─── */
export const permits: SHPermit[] = [
  { id:1, jobCode:"BH-1001", community:"Brite Ridge",    city:"Miami",        permitType:"Building", permitSubType:"Building", submittedDate:"2025-06-15", approvedDate:"2025-06-20", issuedDate:"2025-06-20", daysInReview:5, status:"approved", year:2025 },
  { id:2, jobCode:"BH-1002", community:"Brite Ridge",    city:"Miami",        permitType:"Building", permitSubType:"Building", submittedDate:"2025-08-25", approvedDate:"2025-09-01", issuedDate:"2025-09-01", daysInReview:7, status:"approved", year:2025 },
  { id:3, jobCode:"BH-1003", community:"Brite Ridge",    city:"Miami",        permitType:"Electrical", permitSubType:"Building", submittedDate:"2025-11-10", approvedDate:null, issuedDate:null, daysInReview:136, status:"in-review", year:2025 },
  { id:4, jobCode:"BH-1006", community:"Brite Ridge",    city:"Miami",        permitType:"Building", permitSubType:"Building", submittedDate:"2026-02-20", approvedDate:null, issuedDate:null, daysInReview:33, status:"in-review", year:2026 },
  { id:5, jobCode:"BH-2001", community:"Brite Coast",    city:"Jacksonville", permitType:"Building", permitSubType:"Building", submittedDate:"2025-08-30", approvedDate:"2025-09-12", issuedDate:"2025-09-12", daysInReview:13, status:"approved", year:2025 },
  { id:6, jobCode:"BH-2002", community:"Brite Coast",    city:"Jacksonville", permitType:"Plumbing", permitSubType:"Building", submittedDate:"2025-11-05", approvedDate:"2025-11-22", issuedDate:"2025-11-22", daysInReview:17, status:"approved", year:2025 },
  { id:7, jobCode:"BH-2004", community:"Brite Coast",    city:"Jacksonville", permitType:"Building", permitSubType:"Building", submittedDate:"2026-01-15", approvedDate:null, issuedDate:null, daysInReview:69, status:"in-review", year:2026 },
  { id:8, jobCode:"BH-3001", community:"Brite Bay",      city:"Tampa",        permitType:"Building", permitSubType:"Building", submittedDate:"2025-10-10", approvedDate:"2025-10-28", issuedDate:"2025-10-28", daysInReview:18, status:"approved", year:2025 },
  { id:9, jobCode:"BH-3002", community:"Brite Bay",      city:"Tampa",        permitType:"Electrical", permitSubType:"Building", submittedDate:"2025-06-20", approvedDate:"2025-07-08", issuedDate:"2025-07-08", daysInReview:18, status:"approved", year:2025 },
  { id:10, jobCode:"BH-3003", community:"Brite Bay",     city:"Tampa",        permitType:"Building", permitSubType:"Building", submittedDate:"2025-09-05", approvedDate:"2025-09-22", issuedDate:"2025-09-22", daysInReview:17, status:"approved", year:2025 },
  { id:11, jobCode:"BH-4001", community:"Brite Springs", city:"Miami",        permitType:"Building", permitSubType:"Building", submittedDate:"2025-04-10", approvedDate:"2025-04-14", issuedDate:"2025-04-14", daysInReview:4, status:"approved", year:2025 },
  { id:12, jobCode:"BH-4003", community:"Brite Springs", city:"Miami",        permitType:"Plumbing", permitSubType:"Building", submittedDate:"2025-09-05", approvedDate:null, issuedDate:null, daysInReview:202, status:"in-review", year:2025 },
  { id:13, jobCode:"BH-5001", community:"Brite Park",    city:"Tampa",        permitType:"Building", permitSubType:"Building", submittedDate:"2025-03-10", approvedDate:"2025-03-14", issuedDate:"2025-03-14", daysInReview:4, status:"approved", year:2025 },
  { id:14, jobCode:"BH-5005", community:"Brite Park",    city:"Tampa",        permitType:"Electrical", permitSubType:"Building", submittedDate:"2025-09-30", approvedDate:"2025-10-01", issuedDate:"2025-10-01", daysInReview:1, status:"approved", year:2025 },
  { id:15, jobCode:"BH-6001", community:"Brite Landing", city:"Jacksonville", permitType:"Building", permitSubType:"Building", submittedDate:"2025-08-20", approvedDate:"2025-09-18", issuedDate:"2025-09-18", daysInReview:29, status:"approved", year:2025 },
];

/* ─── Property Units ─── */
export const propertyUnits: SHPropertyUnit[] = [
  { id:1, address:"234 Brite Ridge Dr",    community:"Brite Ridge",    city:"Miami",        entity:"Brite Homes Inc",        bedsBaths:"3/2.5", sqft:2100, monthlyRent:2800, marketRent:2950, deposit:2800, managementPct:8, occupancy:"leased",  tenant:"Johnson Family",     leaseEnd:"2027-05-01", delinquentAmount:0, daysPastDue:0 },
  { id:2, address:"456 Brite Vista Ave",   community:"Brite Ridge",    city:"Miami",        entity:"Brite Homes Inc",        bedsBaths:"4/3", sqft:2400, monthlyRent:3200, marketRent:3400, deposit:3200, managementPct:8, occupancy:"leased",  tenant:"Davis Family",       leaseEnd:"2027-04-15", delinquentAmount:0, daysPastDue:0 },
  { id:3, address:"789 Brite Bay Dr",      community:"Brite Bay",      city:"Tampa",        entity:"Brite Homes Florida LLC", bedsBaths:"3/2", sqft:1900, monthlyRent:2400, marketRent:2550, deposit:2400, managementPct:8, occupancy:"leased",  tenant:"Martinez Couple",    leaseEnd:"2027-05-01", delinquentAmount:150, daysPastDue:8 },
  { id:4, address:"321 Brite Park Ln",     community:"Brite Park",     city:"Tampa",        entity:"Brite Homes Florida LLC", bedsBaths:"3/2.5", sqft:2100, monthlyRent:2700, marketRent:2850, deposit:2700, managementPct:8, occupancy:"leased",  tenant:"Thompson Family",    leaseEnd:"2027-04-01", delinquentAmount:0, daysPastDue:0 },
  { id:5, address:"654 Brite Coast Blvd",  community:"Brite Coast",    city:"Jacksonville", entity:"Brite Homes Florida LLC", bedsBaths:"2/2", sqft:1700, monthlyRent:2200, marketRent:2350, deposit:2200, managementPct:8, occupancy:"vacant", tenant:null, leaseEnd:null, delinquentAmount:0, daysPastDue:0 },
  { id:6, address:"987 Brite Springs Pkwy", community:"Brite Springs",  city:"Miami",        entity:"Brite Homes Inc",        bedsBaths:"4/3", sqft:2500, monthlyRent:3400, marketRent:3600, deposit:3400, managementPct:8, occupancy:"leased",  tenant:"Anderson Family",    leaseEnd:"2027-04-01", delinquentAmount:0, daysPastDue:0 },
  { id:7, address:"111 Brite Ridge Ct",    community:"Brite Ridge",    city:"Miami",        entity:"Brite Homes Inc",        bedsBaths:"3/2", sqft:2000, monthlyRent:2600, marketRent:2750, deposit:2600, managementPct:8, occupancy:"leased",  tenant:"Wilson Family",      leaseEnd:"2027-07-01", delinquentAmount:0, daysPastDue:0 },
  { id:8, address:"222 Brite Bay Way",     community:"Brite Bay",      city:"Tampa",        entity:"Brite Homes Florida LLC", bedsBaths:"2/2", sqft:1800, monthlyRent:2300, marketRent:2450, deposit:2300, managementPct:8, occupancy:"vacant", tenant:null, leaseEnd:null, delinquentAmount:0, daysPastDue:0 },
  { id:9, address:"333 Brite Springs Way", community:"Brite Springs",  city:"Miami",        entity:"Brite Homes Inc",        bedsBaths:"4/3", sqft:2450, monthlyRent:3300, marketRent:3500, deposit:3300, managementPct:8, occupancy:"leased",  tenant:"Garcia Family",      leaseEnd:"2027-06-01", delinquentAmount:500, daysPastDue:30 },
  { id:10, address:"444 Brite Park Ave",   community:"Brite Park",    city:"Tampa",        entity:"Brite Homes Florida LLC", bedsBaths:"3/2.5", sqft:2150, monthlyRent:2750, marketRent:2900, deposit:2750, managementPct:8, occupancy:"leased",  tenant:"Robinson Couple",    leaseEnd:"2027-05-15", delinquentAmount:0, daysPastDue:0 },
];

/* ─── Formatting & Calculations ─── */
export const fmt$ = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
export const fmtN = (n: number) => new Intl.NumberFormat("en-US").format(n);
export const fmtPct = (p: number) => `${Math.round(p)}%`;

export const matchFilters = (item: any, filters: SHDashboardFilters): boolean => {
  if (filters.city && item.city !== filters.city) return false;
  if (filters.entity && item.entity !== filters.entity) return false;
  if (filters.community && item.community !== filters.community) return false;
  if (filters.stage && item.stage && item.stage !== filters.stage) return false;
  if (filters.status) {
    const itemStatus = item.status ?? item.occupancy ?? null;
    if (itemStatus && String(itemStatus).toLowerCase() !== filters.status.toLowerCase()) return false;
  }
  if (filters.drillYear || filters.drillQuarter) {
    const dateStr: string | null = item.startDate ?? item.contractDate ?? item.submittedDate ?? item.closeDate ?? item.expirationDate ?? item.leaseEnd ?? null;
    if (dateStr) {
      const d = new Date(dateStr);
      if (filters.drillYear && d.getFullYear() !== filters.drillYear) return false;
      if (filters.drillQuarter) {
        const q = Math.ceil((d.getMonth() + 1) / 3);
        if (q !== filters.drillQuarter) return false;
      }
    }
  }
  return true;
};

export const getConstructionKPIs = (jobs: SHJob[]) => ({
  totalJobs: jobs.length,
  activeJobs: jobs.filter(j => !["Closing"].includes(j.stage)).length,
  avgCompletion: jobs.reduce((s, j) => s + j.completionPct, 0) / Math.max(jobs.length, 1),
  totalWip: jobs.reduce((s, j) => s + j.wipBalance, 0),
});

export const getJobsByStage = (jobs: SHJob[]) => {
  const stages = [...STAGES];
  return stages.map(stage => ({
    label: stage,
    value: jobs.filter(j => j.stage === stage).length,
    color: ["#0f766e", "#0d9488", "#14b8a6", "#22d3ee", "#3b82f6", "#1e40af"][stages.indexOf(stage)] ?? "#14b8a6",
  }));
};

export const getCommunityBreakdown = (jobs: SHJob[]) => {
  const communities = [...new Set(jobs.map(j => j.community))];
  return communities.map(comm => ({
    label: comm,
    value: jobs.filter(j => j.community === comm).length,
  })).sort((a, b) => b.value - a.value);
};

export const getCostKPIs = (jobs: SHJob[]) => ({
  totalBudget: jobs.reduce((s, j) => s + j.originalBudget, 0),
  totalActual: jobs.reduce((s, j) => s + j.actualCostToDate, 0),
  variance: jobs.reduce((s, j) => s + (j.actualCostToDate - j.originalBudget), 0),
  avgMargin: jobs.reduce((s, j) => s + j.marginPct, 0) / Math.max(jobs.length, 1),
});

export const getCostBreakdown = () => [
  { label: "Labor", value: 1200000, color: "#14b8a6" },
  { label: "Materials", value: 1600000, color: "#0d9488" },
  { label: "Subs", value: 1100000, color: "#22d3ee" },
  { label: "Overhead", value: 420000, color: "#3b82f6" },
];

export const getSalesKPIs = (sales: SHSale[]) => ({
  totalSales: sales.length,
  totalValue: sales.reduce((s, s2) => s + s2.salePrice, 0),
  avgPrice: sales.reduce((s, s2) => s + s2.salePrice, 0) / Math.max(sales.length, 1),
  pendingClosings: sales.filter(s => s.status === "pending").length,
});

export const getSalesByPlan = (sales: SHSale[]) => {
  const plans = [...new Set(sales.map(s => s.plan))];
  return plans.map(plan => ({
    label: plan,
    value: sales.filter(s => s.plan === plan).length,
    color: ["#14b8a6", "#0d9488", "#22d3ee"][plans.indexOf(plan)] ?? "#14b8a6",
  }));
};

export const getLoansKPIs = (loans: SHLoan[]) => ({
  totalExposure: loans.reduce((s, l) => s + l.loanAmount, 0),
  totalDrawn: loans.reduce((s, l) => s + l.totalDrawn, 0),
  drawPercentage: (loans.reduce((s, l) => s + l.totalDrawn, 0) / Math.max(loans.reduce((s, l) => s + l.loanAmount, 0), 1)) * 100,
  expiringSoon: loans.filter(l => new Date(l.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length,
});

export const getLandKPIs = (deals: SHLandDeal[]) => ({
  activeDeals: deals.filter(d => d.status === "under-contract").length,
  closed: deals.filter(d => d.status === "closed").length,
  totalLots: deals.reduce((s, d) => s + d.lots, 0),
  cancelRate: (deals.filter(d => d.status === "cancelled").length / Math.max(deals.length, 1)) * 100,
});

export const getPermitKPIs = (permits: SHPermit[]) => ({
  inPermitting: permits.filter(p => p.status === "in-review" || p.status === "pending").length,
  avgDays: Math.round(permits.reduce((s, p) => s + p.daysInReview, 0) / Math.max(permits.length, 1)),
  stuckOver90: permits.filter(p => (p.status === "in-review" || p.status === "pending") && p.daysInReview > 90).length,
  approvedThisMonth: permits.filter(p => p.approvedDate && new Date(p.approvedDate).getMonth() === new Date().getMonth()).length,
});

export const getPropertyKPIs = (units: SHPropertyUnit[]) => ({
  totalUnits: units.length,
  occupancy: (units.filter(u => u.occupancy === "leased").length / Math.max(units.length, 1)) * 100,
  monthlyRevenue: units.filter(u => u.occupancy === "leased").reduce((s, u) => s + u.monthlyRent, 0),
  vacancies: units.filter(u => u.occupancy !== "leased").length,
});

export const getCycleTimeKPIs = (jobs: SHJob[]) => ({
  avgCycleTime: jobs.reduce((s, j) => s + j.totalCycleDays, 0) / Math.max(jobs.length, 1),
  fastest: Math.min(...jobs.map(j => j.totalCycleDays), 365),
  slowest: Math.max(...jobs.map(j => j.totalCycleDays), 1),
  inPermit: jobs.filter(j => j.stage === "Permit").length,
});

export const getCommunityByCity = (jobs: SHJob[]) => {
  const cities = [...new Set(jobs.map(j => j.city))];
  return cities.map(city => ({
    label: city,
    value: jobs.filter(j => j.city === city).length,
  })).sort((a, b) => b.value - a.value);
};
