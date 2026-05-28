-- =============================================================================
-- Brite Homes: CentralizedData → Scaffold Raw Tables
-- Source: atomic-venture-404412.Centralized.CentralizedData (external, read-only)
-- Target: atomic-venture-404412.brite_homes_raw.*
--
-- Excel serial date conversion: DATE_ADD(DATE '1899-12-30', INTERVAL val DAY)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. job_cost — one row per job (no cost-code breakdown available)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.job_cost` AS
SELECT
  Job_No                                              AS job_id,
  COALESCE(Plan_Name, Job_No)                         AS job_name,
  Project_Name                                        AS community,
  'TOTAL'                                             AS cost_code,
  'Total Job Cost'                                    AS cost_code_description,
  CAST(Original_Budget AS FLOAT64)                    AS budgeted_amount,
  CAST(Job_Cost_Amount AS FLOAT64)                    AS actual_amount,
  0.0                                                 AS committed_amount,
  CAST(Original_Budget AS FLOAT64)
    - CAST(Job_Cost_Amount AS FLOAT64)                AS variance,
  'brite_homes'                                       AS _source_erp,
  CURRENT_TIMESTAMP()                                 AS _extracted_at
FROM `atomic-venture-404412.Centralized.CentralizedData`
WHERE Job_No IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 2. schedule — one row per job/lot with stage and milestone dates
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.schedule` AS
SELECT
  COALESCE(CAST(Lot AS STRING), CAST(Job AS STRING))  AS lot_id,
  Job_No                                              AS job_id,
  Project_Name                                        AS community,
  Plan_Name                                           AS plan_name,
  Superintendent                                      AS superintendent,

  -- start_date: prefer the proper DATE column Job_Start, fall back to serial
  COALESCE(
    CAST(Job_Start AS TIMESTAMP),
    CASE WHEN SAFE_CAST(Start_Date AS INT64) IS NOT NULL
         THEN TIMESTAMP(DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Start_Date AS INT64) DAY))
         ELSE NULL END
  )                                                   AS start_date,

  -- target_close_date: use Projected_Close_Date or Scheduled_Closing (both DATE)
  COALESCE(
    CAST(Projected_Close_Date AS TIMESTAMP),
    CAST(Scheduled_Closing AS TIMESTAMP)
  )                                                   AS target_close_date,

  -- actual_close_date: Closed_Date or Closing_Date (both DATE)
  COALESCE(
    CAST(Closed_Date AS TIMESTAMP),
    CAST(Closing_Date AS TIMESTAMP)
  )                                                   AS actual_close_date,

  Current_Stage                                       AS current_stage,

  -- stage_start_date: approximate from the most recent milestone serial date
  CASE
    WHEN SAFE_CAST(Date_Last_Milestone_Task_Completed AS INT64) IS NOT NULL
    THEN TIMESTAMP(DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Date_Last_Milestone_Task_Completed AS INT64) DAY))
    ELSE NULL
  END                                                 AS stage_start_date,

  'brite_homes'                                       AS _source_erp,
  CURRENT_TIMESTAMP()                                 AS _extracted_at

FROM `atomic-venture-404412.Centralized.CentralizedData`
WHERE Job_No IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 3. vendors — empty shell (no PO-level data in this source)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.vendors` (
  vendor_name     STRING,
  vendor_id       STRING,
  po_number       STRING,
  job_id          STRING,
  cost_code       STRING,
  po_amount       FLOAT64,
  invoiced_amount FLOAT64,
  status          STRING,
  issue_date      TIMESTAMP,
  due_date        TIMESTAMP,
  _source_erp     STRING,
  _extracted_at   TIMESTAMP
);


-- -----------------------------------------------------------------------------
-- 4. sales — one row per sale/contract
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.sales` AS
SELECT
  COALESCE(
    NULLIF(jobsaleid, ''),
    CAST(Sale_Number AS STRING),
    Job_No
  )                                                   AS contract_number,

  COALESCE(CAST(Lot AS STRING), CAST(Job AS STRING))  AS lot_id,
  Project_Name                                        AS community,
  Plan_Name                                           AS plan_name,
  Buyer                                               AS buyer_name,

  -- sale_price: best available price field
  COALESCE(
    CAST(ClosingPrice__Job_ AS FLOAT64),
    CAST(NULLIF(CAST(Sales_Total AS STRING), '0') AS FLOAT64),
    CAST(NULLIF(CAST(Base_Price__Sales_ AS STRING), '0') AS FLOAT64)
  )                                                   AS sale_price,

  -- contract_date: Sold_Date (serial) or Accepted_Date (serial)
  CASE
    WHEN SAFE_CAST(Sold_Date AS INT64) IS NOT NULL
    THEN TIMESTAMP(DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Sold_Date AS INT64) DAY))
    WHEN SAFE_CAST(Accepted_Date AS INT64) IS NOT NULL
    THEN TIMESTAMP(DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Accepted_Date AS INT64) DAY))
    ELSE NULL
  END                                                 AS contract_date,

  -- projected_close
  COALESCE(
    CAST(Projected_Close_Date AS TIMESTAMP),
    CAST(Scheduled_Closing AS TIMESTAMP)
  )                                                   AS projected_close,

  Sales_Status                                        AS status,

  -- cancellation_date: not available in source
  CAST(NULL AS TIMESTAMP)                             AS cancellation_date,

  'brite_homes'                                       AS _source_erp,
  CURRENT_TIMESTAMP()                                 AS _extracted_at

FROM `atomic-venture-404412.Centralized.CentralizedData`
WHERE Job_No IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 5. construction_milestones — bonus table with rich milestone data
--    (not part of core scaffold but powers Brite Homes dashboards)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.construction_milestones` AS
SELECT
  Job_No                                              AS job_id,
  Project_Name                                        AS community,
  Plan_Name                                           AS plan_name,
  Superintendent                                      AS superintendent,
  Project_Manager                                     AS project_manager,
  Company_Name                                        AS company_name,
  Division_Name                                       AS division_name,
  Construction_Type                                   AS construction_type,
  Job_Type                                            AS job_type,
  Job_Status                                          AS job_status,
  Sales_Status                                        AS sales_status,
  Current_Stage                                       AS current_stage,
  SAFE_CAST(Current_Stage_Code AS INT64)              AS current_stage_code,
  SAFE_CAST(Completion_Percentage AS FLOAT64)         AS completion_pct,
  Address                                             AS address,
  Address_City                                        AS city,
  Address_State                                       AS state,
  Address_County                                      AS county,
  Elevation_Name                                      AS elevation,
  Lot                                                 AS lot,
  Block                                               AS block,
  Section                                             AS section,

  -- Key dates (proper DATE columns)
  Job_Start                                           AS job_start,
  Clear_Lot                                           AS clear_lot_date,
  Build_Pad                                           AS build_pad_date,
  Completion_Date                                     AS completion_date,
  Closed_Date                                         AS closed_date,
  Closing_Date                                        AS closing_date,
  Permit_Issued                                       AS permit_issued_date,
  Released_to_Construction                            AS released_to_construction_date,

  -- Milestone serial dates → proper dates
  CASE WHEN SAFE_CAST(Underground_Plumbing AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Underground_Plumbing AS INT64) DAY) END AS underground_plumbing_date,
  CASE WHEN SAFE_CAST(Pour_Slab AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Pour_Slab AS INT64) DAY) END           AS pour_slab_date,
  CASE WHEN SAFE_CAST(Block_House AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Block_House AS INT64) DAY) END         AS block_house_date,
  CASE WHEN SAFE_CAST(Frame_House AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Frame_House AS INT64) DAY) END         AS frame_house_date,
  CASE WHEN SAFE_CAST(Dry_in_Roof AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Dry_in_Roof AS INT64) DAY) END         AS dry_in_roof_date,
  CASE WHEN SAFE_CAST(Insulate_House AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Insulate_House AS INT64) DAY) END      AS insulate_house_date,
  CASE WHEN SAFE_CAST(Drywall_House AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Drywall_House AS INT64) DAY) END       AS drywall_house_date,
  CASE WHEN SAFE_CAST(Flooring_Install AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Flooring_Install AS INT64) DAY) END    AS flooring_install_date,
  CASE WHEN SAFE_CAST(Cabinet_Install AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Cabinet_Install AS INT64) DAY) END     AS cabinet_install_date,
  CASE WHEN SAFE_CAST(Hot_Check AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Hot_Check AS INT64) DAY) END           AS hot_check_date,
  CASE WHEN SAFE_CAST(AC_Startup AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(AC_Startup AS INT64) DAY) END          AS ac_startup_date,
  CASE WHEN SAFE_CAST(Receive_CO AS INT64) IS NOT NULL
       THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(Receive_CO AS INT64) DAY) END          AS receive_co_date,

  -- Cycle times (days between milestones)
  SAFE_CAST(Start_To_Completion AS INT64)             AS start_to_completion_days,
  SAFE_CAST(Start_to_Pad_Build AS INT64)              AS start_to_pad_days,
  SAFE_CAST(Block_to_Insulation AS INT64)             AS block_to_insulation_days,
  SAFE_CAST(Insulation_to_Flooring AS INT64)          AS insulation_to_flooring_days,
  SAFE_CAST(Flooring_to_Hot_Check AS INT64)           AS flooring_to_hot_check_days,
  SAFE_CAST(Hot_Check_to_Completion AS INT64)         AS hot_check_to_completion_days,

  -- Financial summary
  SAFE_CAST(Original_Budget AS FLOAT64)               AS original_budget,
  SAFE_CAST(Job_Cost_Amount AS FLOAT64)               AS job_cost_amount,
  SAFE_CAST(Variance_in_Flight AS FLOAT64)            AS variance_in_flight,
  SAFE_CAST(WIP AS FLOAT64)                           AS wip,
  SAFE_CAST(WIP_without_Lot AS FLOAT64)               AS wip_without_lot,
  SAFE_CAST(Lot_Cost AS FLOAT64)                      AS lot_cost,
  SAFE_CAST(Equity AS FLOAT64)                        AS equity,

  -- Loan info
  Lender                                              AS lender,
  Loan_Number                                         AS loan_number,
  Loan_Amount                                         AS loan_amount,
  SAFE_CAST(Interest_Rate AS FLOAT64)                 AS interest_rate,
  SAFE_CAST(Total_Drawn AS FLOAT64)                   AS total_drawn,
  SAFE_CAST(Days_Until_Expiration AS INT64)            AS loan_days_until_expiration,

  'brite_homes'                                       AS _source_erp,
  CURRENT_TIMESTAMP()                                 AS _extracted_at

FROM `atomic-venture-404412.Centralized.CentralizedData`
WHERE Job_No IS NOT NULL;


-- -----------------------------------------------------------------------------
-- 6. audit_pl_summary — operator-curated P&L per job (per-portfolio)
-- Source: Centralized.ConstructionAudits external table (federated Google Sheet),
--         which itself IMPORTRANGE-consolidates the "Audits" tab from both the
--         Investor Audits and BPOF Audits operator workbooks. This is the
--         authoritative bottom-line P&L data the operations team trusts.
-- The external table is defined as:
--   CREATE OR REPLACE EXTERNAL TABLE `Centralized.ConstructionAudits`
--   OPTIONS (format='GOOGLE_SHEETS', uris=['<centralized-data-2.0-url>'],
--            sheet_range='Construction audits', skip_leading_rows=2)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.audit_pl_summary` AS
SELECT
  -- Provenance
  CASE
    WHEN LOWER(Area_Name) LIKE '%brite properties of florida%' THEN 'bpof_audits'
    ELSE 'investor_audits'
  END                                                 AS _source_sheet,
  '1x7bTl6_YTiC_A_NqUbE9uvNYFDiJrYZP8xW3iLju4o4'      AS _source_sheet_id,
  ROW_NUMBER() OVER (ORDER BY Job_No)                 AS _source_row,
  CURRENT_TIMESTAMP()                                 AS _loaded_at,

  -- Identity
  Job_No                                              AS job_id,
  Address                                             AS address,
  Area_Name                                           AS area_name,
  Job_Type                                            AS job_type,
  Rental_Status                                       AS rental_status,
  Address_City                                        AS city,
  Sales_Status                                        AS sales_status,
  Plan_Name                                           AS plan_name,
  Furthest_Milestone_Completed                        AS furthest_milestone_completed,
  Lot_Type                                            AS lot_type,
  Start_Date                                          AS start_date,
  Completion_Date                                     AS completion_date,
  Cycle_time_from_start                               AS cycle_time_days,

  -- Revenue + P&L
  -- NOTE: BPOF Audits source sheet has Net Margin in col 18 and Proceeds in col 19.
  -- Investor Audits source sheet has Proceeds in col 18 and Net Margin in col 19.
  -- The upstream IMPORTRANGE+QUERY in Centralized Data 2.0 concatenates them BY POSITION,
  -- not by header name, so BPOF rows arrive with these two columns misaligned. Swap them
  -- back here using Area_Name as the book indicator. Same goes for BGH_Total/BGH_Margin
  -- if applicable — verified swap only affects net_margin/proceeds pair.
  CAST(Sales_Price AS FLOAT64)                        AS sale_price,
  CAST(Net_Profit AS FLOAT64)                         AS net_profit,
  CASE
    WHEN LOWER(Area_Name) LIKE '%brite properties of florida%' THEN Proceeds
    ELSE Net_Margin
  END                                                 AS net_margin,
  CASE
    WHEN LOWER(Area_Name) LIKE '%brite properties of florida%' THEN Net_Margin
    ELSE Proceeds
  END                                                 AS proceeds,
  CAST(BGH_Total AS FLOAT64)                          AS bgh_total,
  BGH_Margin                                          AS bgh_margin,
  CAST(Cost_To_Sale AS FLOAT64)                       AS cost_to_sale,

  -- Cost rollups
  CAST(Total_Cost AS FLOAT64)                         AS total_cost,
  CAST(Total_Direct_Cost AS FLOAT64)                  AS total_direct_cost,
  CAST(Total_Indirect_Cost AS FLOAT64)                AS total_indirect_cost,
  CAST(Total_Direct___Financing AS FLOAT64)           AS total_direct_plus_financing,
  CAST(Contigency AS FLOAT64)                         AS contingency,  -- sheet typo kept verbatim
  SAFE_CAST(Correction AS FLOAT64)                    AS correction,

  -- Closing / Financing
  CAST(Seller_Credit AS FLOAT64)                      AS seller_credit,
  CAST(Closing_Cost AS FLOAT64)                       AS closing_cost,
  CAST(Financing AS FLOAT64)                          AS financing,
  CAST(Financing_Left AS FLOAT64)                     AS financing_left,
  CAST(Total_Financing AS FLOAT64)                    AS total_financing,
  CAST(Insurance_Builder_s_Risk AS FLOAT64)           AS insurance_builder_risk,

  -- Loan
  CAST(Amount_Drawn AS FLOAT64)                       AS amount_drawn,
  CAST(Loan_Amount AS FLOAT64)                        AS loan_amount,
  Lender                                              AS lender,
  Loan_Closing_Date                                   AS loan_closing_date,
  Last_Interest_Payment                               AS last_interest_payment_date,

  -- Vertical
  CAST(Current_Vertical_Budget AS FLOAT64)            AS current_vertical_budget,
  CAST(Difference AS FLOAT64)                         AS vertical_difference,
  CAST(Total_Vertical AS FLOAT64)                     AS total_vertical,
  CAST(Vertical AS FLOAT64)                           AS vertical,
  CAST(Vertial_Cost_Left AS FLOAT64)                  AS vertical_cost_left,  -- sheet typo kept verbatim

  -- Dirt / Permitting / Line items
  CAST(Dirt_pad_Booked AS FLOAT64)                    AS dirt_pad_booked,
  CAST(Extra_Dirt AS FLOAT64)                         AS extra_dirt,
  CAST(Dirt_Total AS FLOAT64)                         AS dirt_total,
  CAST(NULL AS FLOAT64)                               AS import_dirt,        -- not on Audits tab; lives on Costs tab
  CAST(Permitting AS FLOAT64)                         AS permitting,
  CAST(Budgeted_Permitting AS FLOAT64)                AS budgeted_permitting,
  CAST(Permitting_Left AS FLOAT64)                    AS permitting_left,
  CAST(Permitting_Total AS FLOAT64)                   AS permitting_total,
  CAST(Lot___Land AS FLOAT64)                         AS lot_land,
  CAST(Site_Work AS FLOAT64)                          AS site_work,
  CAST(Dumpsters___Portable_Toilets AS FLOAT64)       AS dumpsters_portable_toilets,
  Builder_Fee__                                       AS builder_fee_pct,    -- e.g. 'Fixed' or '11.00%'
  CAST(Builder_Fee AS FLOAT64)                        AS builder_fee,
  CAST(Options AS FLOAT64)                            AS options,
  CAST(Gopher_Tortoise_Survey AS FLOAT64)             AS gopher_tortoise_survey,

  -- Utilities
  CAST(Individual_Well AS FLOAT64)                    AS individual_well,
  CAST(Septic_System AS FLOAT64)                      AS septic_system,
  CAST(Water_Filtration_System AS FLOAT64)            AS water_filtration_system,

  -- Free text
  Notes                                               AS notes

FROM `atomic-venture-404412.Centralized.ConstructionAudits`
-- Filter out a stray "Job No" header row that occasionally slips through
-- the upstream IMPORTRANGE/QUERY consolidation. Job IDs follow ##### - ######.
WHERE REGEXP_CONTAINS(Job_No, r'^\d{5}-\d{6}$');
