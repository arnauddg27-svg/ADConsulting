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




-- ============================================================================
-- Centralized Data 2.0 → brite_homes_raw passthrough transforms
-- One transform per Centralized.* external table. Most are SELECT * with the
-- identifier column (Job_No / Job_Number / Column1) aliased to job_id and a
-- _extracted_at provenance timestamp added. Column names retain their sheet
-- form (PascalCase after autodetect normalization, e.g. Address_City) so the
-- bot's schema catalog can discover them without further mapping.
-- ============================================================================


-- Per-job BPOF WIP lookup (job_id → $ amount)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.bpof_wip` AS
SELECT
  `Job_No` AS job_id,
  `BPOF_WIP`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.BpofWip`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Forecasted milestone dates per job (JME baselines)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.jme_future_dates` AS
SELECT
  `Job_No` AS job_id,
  `_5___Clear_Lot_Future`,
  `_25___Block_House_Future`,
  `_40___Electrical_Rough_in_Future`,
  `_75___Electrical_Trimout_Future`,
  `_90___Final_Exterior_Paint_Future`,
  `_92___Final_survey_Future`,
  `_100___Turned_over_Future`,
  `Buildpro_Revised_Closing_Date`,
  `Template_Baseline_end_Date`,
  `JME_Actual_End_Date`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.JmeFutureDates`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Job Cost on Closed lookup ($)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.job_cost_on_closed` AS
SELECT
  `Job_No` AS job_id,
  `Job_Cost_on_Closed`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.JobCostOnClosed`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Brite Assets drawable WIP lookup ($)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.brite_assets_drawable_wip` AS
SELECT
  `Job_No` AS job_id,
  `Brite_Assests_Drawable_WIP`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.BriteAssetsDrawableWip`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Financing cost lookup ($)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.financing_cost` AS
SELECT
  `Job_No` AS job_id,
  `Financing_Cost`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.FinancingCost`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Lot cost on closed lookup ($)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.lot_cost_closed` AS
SELECT
  `Job_No` AS job_id,
  `Lot_Cost_Closed`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.LotCostClosed`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- BPOF drawable WIP lookup ($)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.bpof_drawable_wip` AS
SELECT
  `Job_No` AS job_id,
  `BPOF_Drawable_WIP`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.BpofDrawableWip`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Per-job lot cost lookup ($) — distinct from construction_milestones.lot_cost
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.lot_cost_lookup` AS
SELECT
  `Job_No` AS job_id,
  `Lot_Cost`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.LotCost`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Brite Assets WIP lookup ($)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.brite_assets_wip` AS
SELECT
  `Job_No` AS job_id,
  `Brite_Assests_WIP`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.BriteAssetsWip`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Master sales table (129 cols) — broader than the raw `sales` contract table; all cols STRING
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.sales_master` AS
SELECT
  `Job_No` AS job_id,
  `Client`,
  `Client_Name`,
  `Company`,
  `Company_Name`,
  `Division`,
  `Division_Name`,
  `Region`,
  `Region_Name`,
  `Area`,
  `Area_Name`,
  `Project`,
  `Project_Name`,
  `Job_Type_Code`,
  `Job_Type`,
  `Model_Spec`,
  `Job`,
  `Lot`,
  `Block`,
  `Section`,
  `Address`,
  `City`,
  `State`,
  `Zip`,
  `Released_To_Sales_Date`,
  `Sales_Status`,
  `Job_Status`,
  `Cancel_Date`,
  `Cancel_Week_No`,
  `Cancel_Month`,
  `Cancel_Year`,
  `Cancel_Code`,
  `Cancel_Reason`,
  `Released_To_Construction_Date`,
  `Start_Date`,
  `Superintendent`,
  `Stage_Code_At_Sale`,
  `Stage_At_Sale`,
  `Current_Stage_Code`,
  `Current_Stage_of_Construction`,
  `Plan`,
  `Plan_Name`,
  `Elevation`,
  `Elevation_Name`,
  `Swing`,
  `Living_Area_SF`,
  `Marketing_SF`,
  `Buyer`,
  `Co_Buyer`,
  `Buyer_Address`,
  `Buyer_City`,
  `Buyer_State`,
  `Buyer_Zip`,
  `Buyer_Cell_Phone`,
  `Buyer_Email`,
  `Co_Buyer_Email`,
  `Co_Buyer_Cell_Phone`,
  `Written_Date`,
  `Sold_Date`,
  `Sold_Week_No`,
  `Sold_Month`,
  `Sold_Year`,
  `Accepted_Date`,
  `Memo`,
  `Sale_Source`,
  `Sale_Number`,
  `Base`,
  `Lot_Premium`,
  `Change_Orders`,
  `Sales_Discretionary`,
  `Additional_Price_Fields`,
  `Total`,
  `Closing_Cost`,
  `Total_Deposits`,
  `MLSPrice_Job`,
  `Promised_Date`,
  `Projected_Completion_Date`,
  `Projected_Profits`,
  `Completion_Date`,
  `Projected_Close_Date`,
  `Scheduled_Close_Date`,
  `Close_Date`,
  `Close_Week_No`,
  `Close_Month`,
  `Close_Year`,
  `Net_Profit_Est`,
  `Net_Margin_Est`,
  `Sales_Agent`,
  `Realtor_Company`,
  `Realtor`,
  `Mortgage_Company`,
  `Mortgage_Contact`,
  `Loan_Type`,
  `Loan_Application_Date`,
  `Loan_Approved_Date`,
  `Title_Company`,
  `Title_Contact`,
  `Contingent_Sale`,
  `Contingent_Address`,
  `Contingent_Delivery_Date`,
  `Contingency_Removed_Date`,
  `Sale_Source_Code`,
  `Realtor_Code`,
  `Mortgage_Company_Code`,
  `Title_Company_Code`,
  `ClientID`,
  `CompanyID`,
  `DivisionID`,
  `RegionID`,
  `AreaID`,
  `ProjectID`,
  `JobID`,
  `JobTypeID`,
  `PlanID`,
  `SaleID`,
  `CustomerID`,
  `CurrentStateID`,
  `RealtorID`,
  `MortgageCompanyID`,
  `TitleCompanyID`,
  `ManagingSalesPersonID`,
  `jobsaleid`,
  `Refresh_Date`,
  `Agg_ID`,
  `Lot_Premium_Additional_Price_Fields`,
  `Sales_incentive_Additional_Price_Fields`,
  `Solar_Package_Additional_Price_Fields`,
  `JobType_Job`,
  `Projected_Margin`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.SalesMaster`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Wide construction summary (146 cols)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.construction_summary` AS
SELECT
  `Job_No` AS job_id,
  `Line_Type`,
  `Client`,
  `Client_Name`,
  `Company`,
  `Company_Name`,
  `Division`,
  `Division_Name`,
  `Region`,
  `Region_Name`,
  `Area`,
  `Area_Name`,
  `Project`,
  `Project_Name`,
  `Job_Type_Code`,
  `Job_Type`,
  `Construction_Type`,
  `Building`,
  `Model___Spec`,
  `Job`,
  `Lot_Size`,
  `Lot`,
  `Block`,
  `Section`,
  `Address`,
  `City__Project_`,
  `Sales_Status`,
  `Production_Status`,
  `Job_Status`,
  `Buyer`,
  `Build_Pro_Enabled`,
  `Plan`,
  `Spec_Code`,
  `Plan_Name`,
  `Elevation`,
  `Elevation_Name`,
  `Swing`,
  `Lot_Purchase_Date`,
  `Permits_Date`,
  `Released_to_Construction_Date`,
  `Projected_Start_Date`,
  `Start_Date`,
  `Est_Completion_Date`,
  `Estimated_Completion_Date`,
  `Estimated_Completion_Month`,
  `Completion_Date`,
  `Sold_Date`,
  `Projected_Close_Date`,
  `Scheduled_Close_Date`,
  `Estimated_Scheduled_Closing_Date`,
  `Estimated_Scheduled_Closing_Month`,
  `Close_Date`,
  `Current_Superintendent`,
  `Current_Superintendent_Number`,
  `Project_Manager_Number`,
  `Project_Manager`,
  `Stage_Superintendent`,
  `Stage_Code`,
  `Stage_Description`,
  `Completion_Percentages`,
  `Stage___Desc`,
  `Stage_Date`,
  `Week_End_Date`,
  `Last_Stage_Date`,
  `Days_To_Complete`,
  `CT_Between_Milestones`,
  `Goal`,
  `Carried`,
  `Furthest_Milestone_Completed`,
  `Current_Completion_Percentage`,
  `Date_Furthest_Milestone_Completed`,
  `Last_Milestone_Completed`,
  `Date_Last_Milestone_Completed`,
  `Days_Since_last_Milestone_Completed`,
  `Current_Cycle_Time_to_Completion_Ratio`,
  `Off_On_Track`,
  `Number_of_Days_On_Off`,
  `_1___Job_Start_`,
  `_5___Clear_Lot`,
  `_10___Build_Pad`,
  `_15___Underground_Plumbing`,
  `_20___Pour_Slab`,
  `_25___Block_House`,
  `_30___Frame_House`,
  `_35___Dry_in_Roof`,
  `_40___Electrical_Rough_in`,
  `_45___Insulate_House`,
  `_50___Drywall_House`,
  `_55___Install_1st_Trim`,
  `_60___1st_Interior_Paint`,
  `_65___Flooring_Install`,
  `_70___Cabinet_Install`,
  `_75___Electrical_Trimout`,
  `_80___Hot_Check`,
  `_85___AC_Startup`,
  `_90___Final_Exterior_Paint`,
  `_95___Final_Survey`,
  `_98___Final_site_clean_up`,
  `_100___Receive_CO`,
  `Current_Cycle_Time_From_Lot_Clear`,
  `Current_Cycle_Time_From_Pad_Build`,
  `Current_Cycle_Time_From_Insulation`,
  `Start_to_Pad_Build`,
  `Pad_Build_to_Underground_Plumbing`,
  `Underground_Plumbing_to_Block`,
  `Block_to_Insulation`,
  `Insulation_to_Flooring`,
  `Flooring_to_Hot_Check`,
  `Underground_Plumbing_to_Completion`,
  `Insultation_to_Completion`,
  `Hot_Check_to_Completion`,
  `Note_Date`,
  `Days_since_note`,
  `Notes`,
  `Notes2`,
  `ClientID`,
  `CompanyID`,
  `DivisionID`,
  `RegionID`,
  `AreaID`,
  `SegmentID`,
  `ProjectID`,
  `JobID`,
  `JobTypeID`,
  `LenderID`,
  `LoanID`,
  `LoanAccountID`,
  `LoanInterestAccountID`,
  `SuperintendentID`,
  `PlanSwingID`,
  `PlanID`,
  `PlanElevationID`,
  `PlanSeriesID`,
  `ProjectManagerID`,
  `DecoratorID`,
  `CustomerServiceRepresentativeID`,
  `LotTakedownScheduleID`,
  `SaleID`,
  `ManagingSalesPersonID`,
  `MortgageCompanyID`,
  `jobsaleid`,
  `Refresh_Date`,
  `Agg_ID`,
  `Unique_Job`,
  `Next_Stage_Date`,
  `SpecCode__Job_`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.Construction`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Per-task completion records (11k+ rows; PO, supplier, completion date)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.task_completion` AS
SELECT
  `Column1` AS job_id,
  `Job`,
  `Cost_Code`,
  `Task_Name`,
  `Column4`,
  `Column5`,
  `Supplier`,
  `P_O_`,
  `Subtotal`,
  `Tax`,
  `Column10`,
  `Column11`,
  `Complete_Total`,
  `Contract_Type`,
  `Completed_Date`,
  `Completed_By`,
  `Task_ID`,
  `Job_Task_ID`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.TaskCompletion`
WHERE `Column1` IS NOT NULL AND TRIM(CAST(`Column1` AS STRING)) != '';

-- Master inventory details (1.6k rows × 153 cols)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.inventory_details` AS
SELECT
  `Job_No` AS job_id,
  `Client`,
  `Client_Name`,
  `Company`,
  `Company_Name`,
  `Division`,
  `Division_Name`,
  `Region`,
  `Region_Name`,
  `Area`,
  `Area_Name`,
  `Project`,
  `Project_Name`,
  `Job_Type_Code`,
  `Job_Type`,
  `Construction_Type`,
  `Building`,
  `Model___Spec`,
  `Job`,
  `Lot_Size`,
  `Lot`,
  `Block`,
  `Section`,
  `Address`,
  `Address_Number`,
  `Address_Street`,
  `Address_City`,
  `Address_State`,
  `Address_Postal_Code`,
  `Address_County`,
  `Plan`,
  `Sales_Status`,
  `Sale_Number`,
  `Production_Status`,
  `Job_Status`,
  `Swing`,
  `Current_Stage_Code`,
  `Projected_Start_Date`,
  `Current_Stage`,
  `Date_Last_Milestone_Task_Completed`,
  `Days_Since_last_Milestone_Completed`,
  `Furthest_Milestone_Completed`,
  `Completion_Percentage`,
  `Date_Furthest_Milestone_was_Completed`,
  `Buyer`,
  `Spec_Code`,
  `Plan_Name`,
  `Elevation`,
  `Elevation_Name`,
  `Released_to_Sales_Date`,
  `Written_Date`,
  `Superintendent`,
  `Sold_Date`,
  `Accepted_Date`,
  `Lot_Purchase_Date`,
  `Project_Manager`,
  `Build_Pro_Enabled`,
  `Released_to_Construction_Date`,
  `Start_Date`,
  `POs_Printed_Date`,
  `Plan_Permit_Date`,
  `Permits_Date`,
  `Permit_Number`,
  `Sales_To_Start`,
  `Start_To_Completion`,
  `Sales_To_Close`,
  `Completion_To_Close`,
  `Clear_Lot_Date`,
  `Form_Survey_Date`,
  `Slab_Pour_Date`,
  `Final_Inspection_Date`,
  `Est__Completion_Date`,
  `Estimated_Completion_Date`,
  `Completion_Date`,
  `Buyer_Final_Walk_Date`,
  `Projected_Close_Date`,
  `Scheduled_Close_Date`,
  `Closing_Date`,
  `Closed_Date`,
  `Warranty_Expiration_Date`,
  `Warranty_Number`,
  `Sales_Agent`,
  `Superintendent_Number`,
  `Project_Manager_Number`,
  `Decorator`,
  `Service_Rep`,
  `Lender`,
  `Lender_Name`,
  `Loan_Number`,
  `Loan_Amount`,
  `Mortgage_Company_Code`,
  `Mortgage_Company`,
  `Loan_Application_Date`,
  `Loan_Approval_Date`,
  `ClientID`,
  `CompanyID`,
  `DivisionID`,
  `RegionID`,
  `AreaID`,
  `SegmentID`,
  `ProjectID`,
  `JobID`,
  `JobTypeID`,
  `LenderID`,
  `LoanID`,
  `LoanAccountID`,
  `LoanInterestAccountID`,
  `SuperintendentID`,
  `PlanSwingID`,
  `PlanID`,
  `PlanElevationID`,
  `PlanSeriesID`,
  `ProjectManagerID`,
  `DecoratorID`,
  `CustomerServiceRepresentativeID`,
  `LotTakedownScheduleID`,
  `SaleID`,
  `ManagingSalesPersonID`,
  `MortgageCompanyID`,
  `Refresh_Date`,
  `Agg_ID`,
  `ClearLotDate__Job_`,
  `CloseDate__Job_`,
  `ClosingPrice__Job_`,
  `jobsaleid`,
  `_100_1___Job_Start_`,
  `_105_5___Clear_Lot`,
  `_106_10___Build_Pad`,
  `_110_15___Underground_Plumbing`,
  `_115_20___Pour_Slab`,
  `_120_25___Block_House`,
  `_125_30___Frame_House`,
  `_130_35___Dry_in_Roof`,
  `_135_40___Electrical_Rough_in`,
  `_140_45___Insulate_House`,
  `_145_50___Drywall_House`,
  `_150_55___Install_1st_Trim`,
  `_155_60___1st_Interior_Paint`,
  `_160_65___Flooring_Install`,
  `_165_70___Cabinet_Install`,
  `_170_75___Deliver_Dishwasher`,
  `_175_75___Plumbing_Trimout`,
  `_180_75___Electrical_Trimout`,
  `_182_80___Hot_Check`,
  `_185_85___AC_Startup`,
  `_190_90___Final_Exterior_Paint`,
  `_192_92___Final_Survey`,
  `_195_94___Final_site_clean_up`,
  `_200_96___Receive_CO`,
  `_205_98___Homeowner_Walk`,
  `_210_100___Close_Home`,
  `Base_Price__Sales_`,
  `SpecCode__Job_`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.InventoryDetails`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Job details master (1.2k rows × 151 cols)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.job_details` AS
SELECT
  `Job_No` AS job_id,
  `Client`,
  `Client_Name`,
  `Company`,
  `Company_Name`,
  `Division`,
  `Division_Name`,
  `Region`,
  `Region_Name`,
  `Area`,
  `Area_Name`,
  `Project`,
  `Project_Name`,
  `Job_Type_Code`,
  `Job_Type`,
  `Construction_Type`,
  `Building`,
  `Model___Spec`,
  `Job`,
  `Lot_Size`,
  `Lot`,
  `Block`,
  `Section`,
  `Address`,
  `Address_Number`,
  `Address_Street`,
  `Address_City`,
  `Address_State`,
  `Address_Postal_Code`,
  `Address_County`,
  `Plan`,
  `Sales_Status`,
  `Sale_Number`,
  `Production_Status`,
  `Job_Status`,
  `Swing`,
  `Current_Stage_Code`,
  `Projected_Start_Date`,
  `Current_Stage`,
  `Date_Last_Milestone_Task_Completed`,
  `Days_Since_last_Milestone_Completed`,
  `Furthest_Milestone_Completed`,
  `Completion_Percentage`,
  `Date_Furthest_Milestone_was_Completed`,
  `Buyer`,
  `Spec_Code`,
  `Plan_Name`,
  `Elevation`,
  `Elevation_Name`,
  `Released_to_Sales_Date`,
  `Written_Date`,
  `Superintendent`,
  `Sold_Date`,
  `Accepted_Date`,
  `Lot_Purchase_Date`,
  `Project_Manager`,
  `Build_Pro_Enabled`,
  `Released_to_Construction_Date`,
  `Start_Date`,
  `POs_Printed_Date`,
  `Plan_Permit_Date`,
  `Permits_Date`,
  `Permit_Number`,
  `Sales_To_Start`,
  `Start_To_Completion`,
  `Sales_To_Close`,
  `Completion_To_Close`,
  `Clear_Lot_Date`,
  `Form_Survey_Date`,
  `Slab_Pour_Date`,
  `Final_Inspection_Date`,
  `Est__Completion_Date`,
  `Estimated_Completion_Date`,
  `Completion_Date`,
  `Buyer_Final_Walk_Date`,
  `Projected_Close_Date`,
  `Scheduled_Close_Date`,
  `Closing_Date`,
  `Closed_Date`,
  `Warranty_Expiration_Date`,
  `Warranty_Number`,
  `Sales_Agent`,
  `Superintendent_Number`,
  `Project_Manager_Number`,
  `Decorator`,
  `Service_Rep`,
  `Lender`,
  `Lender_Name`,
  `Loan_Number`,
  `Loan_Amount`,
  `Mortgage_Company_Code`,
  `Mortgage_Company`,
  `Loan_Application_Date`,
  `Loan_Approval_Date`,
  `ClientID`,
  `CompanyID`,
  `DivisionID`,
  `RegionID`,
  `AreaID`,
  `SegmentID`,
  `ProjectID`,
  `JobID`,
  `JobTypeID`,
  `LenderID`,
  `LoanID`,
  `LoanAccountID`,
  `LoanInterestAccountID`,
  `SuperintendentID`,
  `PlanSwingID`,
  `PlanID`,
  `PlanElevationID`,
  `PlanSeriesID`,
  `ProjectManagerID`,
  `DecoratorID`,
  `CustomerServiceRepresentativeID`,
  `LotTakedownScheduleID`,
  `SaleID`,
  `ManagingSalesPersonID`,
  `MortgageCompanyID`,
  `Refresh_Date`,
  `Agg_ID`,
  `ClearLotDate__Job_`,
  `CloseDate__Job_`,
  `ClosingPrice__Job_`,
  `jobsaleid`,
  `_100_1___Job_Start_`,
  `_105_5___Clear_Lot`,
  `_106_10___Build_Pad`,
  `_110_15___Underground_Plumbing`,
  `_115_20___Pour_Slab`,
  `_120_25___Block_House`,
  `_125_30___Frame_House`,
  `_130_35___Dry_in_Roof`,
  `_135_40___Electrical_Rough_in`,
  `_140_45___Insulate_House`,
  `_145_50___Drywall_House`,
  `_150_55___Install_1st_Trim`,
  `_155_60___1st_Interior_Paint`,
  `_160_65___Flooring_Install`,
  `_165_70___Cabinet_Install`,
  `_170_75___Deliver_Dishwasher`,
  `_175_75___Plumbing_Trimout`,
  `_180_75___Electrical_Trimout`,
  `_182_80___Hot_Check`,
  `_185_85___AC_Startup`,
  `_190_90___Final_Exterior_Paint`,
  `_192_95___Final_Survey`,
  `_195_98___Final_site_clean_up`,
  `_200_100___Receive_CO`,
  `Base_Price__Sales_`,
  `SpecCode__Job_`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.TblJobDetails`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Takeoff comparison data (4.5k rows × 105 cols, plan-level, no Job_No; all STRING)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.takeoff_compare` AS
SELECT
  `Client`,
  `Client_Name`,
  `Company`,
  `Company_Name`,
  `Division`,
  `Division_Name`,
  `Region`,
  `Region_Name`,
  `Area`,
  `Area_Name`,
  `Project`,
  `Project_Name`,
  `Plan_Number`,
  `Plan`,
  `Plan_Abbreviation`,
  `Elevation`,
  `Plan_Tag`,
  `Elevation_Name`,
  `Stories`,
  `Swing`,
  `Swing_Name`,
  `Series`,
  `Series_Name`,
  `Roof_Pitch`,
  `Living_Sq_Ft`,
  `Option_Category_Code`,
  `Option_Category`,
  `Option_Subcategory_Code`,
  `Option_Subcategory`,
  `Option_Code`,
  `Option_Description`,
  `Option_Suffix_Code`,
  `Option_Suffix_Description`,
  `Sales_Description`,
  `Option_Type`,
  `Compare_Date`,
  `Sales_Price`,
  `Sales_Price_2`,
  `Cost`,
  `Margin`,
  `Margin_2`,
  `Margin_2_2`,
  `Margin_3`,
  `Effective_Date`,
  `Cost_Code_Type`,
  `Category_Code`,
  `Category`,
  `Group_Code`,
  `Group`,
  `Cost_Code_Source`,
  `Cost_Code_Name`,
  `Cost_Code`,
  `Cost_Code_Name_2`,
  `ID`,
  `Vendor_Number`,
  `Vendor`,
  `Item_Number`,
  `Item`,
  `Quantity`,
  `Unit_Cost`,
  `UM`,
  `Divisor`,
  `Factor`,
  `Extended_Cost`,
  `Discount_Percent`,
  `Discount_Amount`,
  `Is_Taxable`,
  `Print_Line_Item_on_PO`,
  `Taxable_Amount`,
  `Tax_Rate`,
  `Tax_Amount`,
  `Total_Cost`,
  `ClientID`,
  `SegmentID`,
  `ProjectID`,
  `PlanID`,
  `CompanyID`,
  `DivisionID`,
  `RegionID`,
  `AreaID`,
  `PlanElevationID`,
  `PlanSwingID`,
  `PlanSeriesID`,
  `OptionCategoryID`,
  `OptionSubcategoryID`,
  `OptionID`,
  `OptionSuffixID`,
  `CostCodeID`,
  `CostCodeCategoryID`,
  `CostCodeGroupID`,
  `TakeOffID`,
  `ItemID`,
  `VendorID`,
  `UnitOfMeasureID`,
  `TaxProjectID`,
  `Unique_Budget`,
  `Refresh_Date`,
  `Agg_ID`,
  `PlansFinalRowNumber`,
  `Unique_Project_Plan`,
  `Unique_Project_Plan_Elevation`,
  `Unique_Project_Plan_Elevation_Swing`,
  `Unique_Project_Plan_Elevation_Swing_Series`,
  `Unique_Project_Plan_Elevation_Swing_Series_Option`,
  `ContractID`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.TblTakeoffCompare`;

-- Detailed loan tracking per job
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.loan_tracker` AS
SELECT
  `Job_Number` AS job_id,
  `Lender`,
  `Address`,
  `Address_City`,
  `Address_State`,
  `Address_Postal_Code`,
  `Address_County`,
  `Area_Name`,
  `Plan`,
  `Parcel_ID`,
  `Permitting_Status`,
  `Job_Type`,
  `Sales_Status`,
  `Appraisal`,
  `Projected_Start_Date`,
  `Projected_Start_Month`,
  `Start_Date`,
  `Furthest_Milestone_Completed`,
  `Status`,
  `Loan_Request_Date`,
  `Loan_Closing_Date`,
  `Loan_Expiration_`,
  `Days_Until_Expiration`,
  `Extended_to_`,
  `Extension__`,
  `Loan_Number`,
  `Loan_Amount`,
  `Interest_Rate`,
  `Monthly_Interest_Payments`,
  `Total_Drawn`,
  `Last_Draw_Date`,
  `WIP`,
  `Equity`,
  `Drawable_WIP_`,
  `Difference`,
  `Status_without_land_loan`,
  `Notes`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.LoanTracker`
WHERE `Job_Number` IS NOT NULL AND TRIM(CAST(`Job_Number` AS STRING)) != '';

-- Permit detail (City, NOC, fees, status)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.permitting_detail` AS
SELECT
  `Job_Number` AS job_id,
  `City`,
  `Owner`,
  `Lot_Closing_Date`,
  `Status`,
  `Status_Change`,
  `Env_Issues`,
  `Address_`,
  `Lot_Block_addition_or_section`,
  `Parcel_ID`,
  `Plan_`,
  `Garage`,
  `Lot_Type`,
  `Clerk`,
  `Permit_number`,
  `Comments`,
  `NOC_Date_Recorded`,
  `Column18`,
  `Furthest_Milestone_Completed`,
  `CM`,
  `Amount`,
  `Day_Check_Requested`,
  `Column1`,
  `Day_Check_Mailed`,
  `_1`,
  `Certificte_of_occupancy__date_`,
  `Column27`,
  `Survey_Ordered`,
  `_1__Survey__CT`,
  `_2__Septic_Permit_CT`,
  `_3__Plans_CT`,
  `_4__Trusses_CT`,
  `_5__Energy_Calculations_CT`,
  `_6__Permit_CT`,
  `_7__Total_Cycle_Tme`,
  `Permit_Approved_Date`,
  `Permit_Issued`,
  `Expiration_for_Email`,
  `Permit_Submitted`,
  `Expiration_Date`,
  `Surveyor`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.PermittingDetail`
WHERE `Job_Number` IS NOT NULL AND TRIM(CAST(`Job_Number` AS STRING)) != '';

-- Older snapshot of Audits tab (207 rows; alt view to Construction audits)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.audits_snapshot` AS
SELECT
  `Job_No` AS job_id,
  `Address`,
  `Area_Name`,
  `Job_Type`,
  `Rental_Status`,
  `Address_City`,
  `Start_Date`,
  `Completion_Date`,
  `Cycle_time_from_start`,
  `Sales_Status`,
  `Plan_Name`,
  `Current_Stage`,
  `Individual_Well`,
  `Septic_System`,
  `Water_Filtration_System`,
  `Lot_Type`,
  `Sales_Price`,
  `Net_Profit`,
  `Proceeds`,
  `Net_Margin`,
  `BGH_Total`,
  `BGH_Margin`,
  `Seller_Credit`,
  `Cost_To_Sale`,
  `Closing_Cost`,
  `Amount_Drawn`,
  `Loan_Amount`,
  `Lender`,
  `Loan_Closing_Date`,
  `Last_Interest_Payment`,
  `Financing`,
  `Financing_Left`,
  `Total_Financing`,
  `Insurance_Builder_s_Risk`,
  `Correction`,
  `Total_Cost`,
  `Contigency`,
  `Total_Indirect_Cost`,
  `Total_Direct_Cost`,
  `Total_Direct___Financing`,
  `Current_Vertical_Budget`,
  `Difference`,
  `Total_Vertical`,
  `Vertical`,
  `Vertial_Cost_Left`,
  `Dumpsters___Portable_Toilets`,
  `Lot___Land`,
  `Builder_Fee__`,
  `Builder_Fee`,
  `Options`,
  `Permitting`,
  `Gopher_Tortoise_Survey`,
  `Budgeted_Permitting`,
  `Permitting_Left`,
  `Permitting_Total`,
  `Site_Work`,
  `Dirt_Booked`,
  `Extra_Dirt`,
  `Dirt_Total`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.AuditsSnapshot`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Progress issue tracking per job
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.progress_issue_notes` AS
SELECT
  `Job_No` AS job_id,
  `Address`,
  `City__Project_`,
  `Job_Type`,
  `Plan_Name`,
  `Area_Name`,
  `Sales_Status`,
  `Start_Date`,
  `Furthest_Milestone_Completed`,
  `Date_Last_Milestone_Completed`,
  `Days_Since_Last_Milestone_Completed`,
  `Current_Superintendent`,
  `Date_issue_recorded`,
  `Date_Issue_Updated`,
  `Issue_Category`,
  `Issue_Resolved`,
  `Assignee`,
  `Vendor`,
  `Root_Cause`,
  `Notes___Updates`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.ProgressIssueNotes`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Warranty tickets (Job_No at col 2, Ticket # at col 0)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.warranty_tickets` AS
SELECT
  `Job_No` AS job_id,
  `Ticket__`,
  `Item__`,
  `Job`,
  `Community`,
  `Ticket_Aged_Days`,
  `Status`,
  `Description`,
  `Supplier`,
  `Item_Status`,
  `Work_Orders`,
  `Location`,
  `Category`,
  `Root_Cause`,
  `Request_Valid`,
  `Column17`,
  `Aging_Days`,
  `Work_Order_Status`,
  `Work_Order_Supplier`,
  `Requested_Start_Date`,
  `ID`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.WarrantyTickets`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';

-- Completed job cost vs budget by category (Project >> Job in col 0)
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.completions` AS
SELECT
  `Project____Job`,
  `Address`,
  `Category`,
  `_Job_Cost_Amount`,
  `_Original_Budget`,
  `_Variation`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.Completions`;

-- In-construction job cost vs budget by category
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.in_construction` AS
SELECT
  `Project____Job`,
  `Address`,
  `Category`,
  `_Job_Cost_Amount`,
  `_Original_Budget`,
  `_Variance_in_Flight`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.InConstruction`;

-- Britten-specific variance analysis
CREATE OR REPLACE TABLE `atomic-venture-404412.brite_homes_raw.britten_variance` AS
SELECT
  `Job_No` AS job_id,
  `Project____Job`,
  `Address`,
  `_Job_Cost_Amount`,
  `_Original_Budget`,
  `_Variance_in_Flight`
  , CURRENT_TIMESTAMP() AS _extracted_at
FROM `atomic-venture-404412.Centralized.BrittenVariance`
WHERE `Job_No` IS NOT NULL AND TRIM(CAST(`Job_No` AS STRING)) != '';


-- ============================================================================
-- STAGING + MART layer on top of the newly-wired raw tables
-- These are VIEWs (cheap, always reflect latest raw refresh) over the raw
-- passthrough tables, with proper types + cross-table joins for usability.
-- ============================================================================

-- ── stg_sales_master ───────────────────────────────────────────────────────
-- Typed view of brite_homes_raw.sales_master (all-STRING raw → proper types).
-- Surfaces the most useful ~30 columns; the raw table has 130 if needed.
CREATE OR REPLACE VIEW `atomic-venture-404412.brite_homes_staging.stg_sales_master` AS
SELECT
  job_id,
  Address AS address,
  City AS city,
  State AS state,
  SAFE_CAST(Zip AS INT64) AS zip,
  Area_Name AS area_name,
  Project_Name AS community,
  Plan_Name AS plan_name,
  Job_Type AS job_type,
  Sales_Status AS sales_status,
  Job_Status AS job_status,
  Buyer AS buyer_name,
  Co_Buyer AS co_buyer,
  Buyer_Address AS buyer_address,
  Current_Stage_of_Construction AS current_stage,
  Superintendent AS superintendent,
  -- Dates: try direct DATE parse first, fall back to Excel serial conversion
  COALESCE(
    SAFE_CAST(NULLIF(Released_To_Sales_Date, '') AS DATE),
    DATE_ADD(DATE '1899-12-30', INTERVAL SAFE_CAST(Released_To_Sales_Date AS INT64) DAY)
  ) AS released_to_sales_date,
  COALESCE(
    SAFE_CAST(NULLIF(Cancel_Date, '') AS DATE),
    DATE_ADD(DATE '1899-12-30', INTERVAL SAFE_CAST(Cancel_Date AS INT64) DAY)
  ) AS cancel_date,
  COALESCE(
    SAFE_CAST(NULLIF(Released_To_Construction_Date, '') AS DATE),
    DATE_ADD(DATE '1899-12-30', INTERVAL SAFE_CAST(Released_To_Construction_Date AS INT64) DAY)
  ) AS released_to_construction_date,
  COALESCE(
    SAFE_CAST(NULLIF(Start_Date, '') AS DATE),
    DATE_ADD(DATE '1899-12-30', INTERVAL SAFE_CAST(Start_Date AS INT64) DAY)
  ) AS start_date,
  Cancel_Reason AS cancel_reason,
  -- All-STRING raw columns; strip $ + , and SAFE_CAST. NULLIF empty.
  -- (Other monetary cols are deeper in the 130-col raw table — add here as needed.)
  Stage_At_Sale AS stage_at_sale,
  _extracted_at AS _refreshed_at
FROM `atomic-venture-404412.brite_homes_raw.sales_master`;


-- ── mart_progress_issues_open ──────────────────────────────────────────────
-- All UNRESOLVED progress issues, joined to construction_milestones for context.
-- Use for ops/scheduling dashboards: "show me jobs blocked by open issues".
CREATE OR REPLACE VIEW `atomic-venture-404412.brite_homes_marts.mart_progress_issues_open` AS
SELECT
  p.job_id,
  COALESCE(p.Address, m.address) AS address,
  m.community,
  COALESCE(p.City__Project_, m.city) AS city,
  COALESCE(p.Job_Type, m.job_type) AS job_type,
  COALESCE(p.Furthest_Milestone_Completed, m.current_stage) AS current_stage,
  p.Area_Name AS area_name,
  p.Plan_Name AS plan_name,
  p.Sales_Status AS sales_status,
  p.Current_Superintendent AS superintendent,
  p.Issue_Category AS issue_category,
  p.Assignee AS assignee,
  p.Vendor AS vendor,
  p.Root_Cause AS root_cause,
  p.Notes___Updates AS notes,
  -- Excel serial → DATE
  DATE_ADD(DATE '1899-12-30', INTERVAL p.Date_issue_recorded DAY) AS date_recorded,
  DATE_ADD(DATE '1899-12-30', INTERVAL p.Date_Issue_Updated DAY) AS date_updated,
  p.Days_Since_Last_Milestone_Completed AS days_since_last_milestone,
  p._extracted_at AS _refreshed_at
FROM `atomic-venture-404412.brite_homes_raw.progress_issue_notes` p
LEFT JOIN `atomic-venture-404412.brite_homes_raw.construction_milestones` m USING (job_id)
WHERE p.Issue_Resolved IS NOT TRUE;  -- include NULLs (unresolved) but exclude TRUE (resolved)


-- ── mart_warranty_summary ──────────────────────────────────────────────────
-- Warranty ticket counts by category + status. Use for "how many open warranty
-- issues do we have" / "which suppliers have the most warranty claims".
CREATE OR REPLACE VIEW `atomic-venture-404412.brite_homes_marts.mart_warranty_summary` AS
SELECT
  Category AS category,
  Status AS ticket_status,
  Item_Status AS item_status,
  Supplier AS supplier,
  COUNT(*) AS ticket_count,
  COUNT(DISTINCT job_id) AS jobs_affected,
  AVG(Ticket_Aged_Days) AS avg_aged_days,
  MAX(Ticket_Aged_Days) AS max_aged_days
FROM `atomic-venture-404412.brite_homes_raw.warranty_tickets`
WHERE job_id IS NOT NULL
GROUP BY category, ticket_status, item_status, supplier;


-- ── mart_warranty_open ─────────────────────────────────────────────────────
-- Detail view of open warranty tickets, joined to construction_milestones.
CREATE OR REPLACE VIEW `atomic-venture-404412.brite_homes_marts.mart_warranty_open` AS
SELECT
  w.job_id,
  w.Ticket__ AS ticket_number,
  w.Item__ AS item_number,
  COALESCE(w.Job, m.address) AS job_label,
  m.community,
  m.city,
  m.current_stage,
  w.Ticket_Aged_Days AS ticket_aged_days,
  w.Status AS ticket_status,
  w.Description AS description,
  w.Supplier AS supplier,
  w.Item_Status AS item_status,
  w.Work_Orders AS work_orders,
  w.Location AS location,
  w.Category AS category,
  w.Root_Cause AS root_cause,
  w.Work_Order_Status AS work_order_status,
  w.Work_Order_Supplier AS work_order_supplier,
  w._extracted_at AS _refreshed_at
FROM `atomic-venture-404412.brite_homes_raw.warranty_tickets` w
LEFT JOIN `atomic-venture-404412.brite_homes_raw.construction_milestones` m USING (job_id)
WHERE w.job_id IS NOT NULL
  AND LOWER(IFNULL(w.Item_Status, '')) != 'closed'
  AND LOWER(IFNULL(w.Status, '')) NOT LIKE '%closed%';


-- ── mart_loan_pipeline ─────────────────────────────────────────────────────
-- Per-job loan status with days-until-expiration, drawn vs available WIP.
-- Joined to construction_milestones for job context (address, stage).
CREATE OR REPLACE VIEW `atomic-venture-404412.brite_homes_marts.mart_loan_pipeline` AS
SELECT
  l.job_id,
  l.Lender AS lender,
  l.Loan_Number AS loan_number,
  l.Loan_Amount AS loan_amount,
  l.Interest_Rate AS interest_rate,
  l.Total_Drawn AS total_drawn,
  l.WIP AS wip,
  l.Drawable_WIP_ AS drawable_wip,
  l.Equity AS equity,
  l.Status AS loan_status,
  l.Permitting_Status AS permitting_status,
  l.Job_Type AS job_type,
  l.Sales_Status AS sales_status,
  l.Furthest_Milestone_Completed AS furthest_milestone,
  l.Days_Until_Expiration AS days_until_expiration,
  -- Excel serial → DATE
  DATE_ADD(DATE '1899-12-30', INTERVAL l.Loan_Closing_Date DAY) AS loan_closing_date,
  DATE_ADD(DATE '1899-12-30', INTERVAL l.Loan_Expiration_ DAY) AS loan_expiration_date,
  DATE_ADD(DATE '1899-12-30', INTERVAL l.Extended_to_ DAY) AS extended_to_date,
  l.Extension__ AS extension_count,
  l.Status_without_land_loan AS status_without_land_loan,
  -- Pipeline-level health flags
  CASE
    WHEN l.Days_Until_Expiration IS NULL THEN 'no expiration tracked'
    WHEN l.Days_Until_Expiration < 0 THEN 'expired'
    WHEN l.Days_Until_Expiration BETWEEN 0 AND 30 THEN 'expiring 30d'
    WHEN l.Days_Until_Expiration BETWEEN 31 AND 60 THEN 'expiring 60d'
    WHEN l.Days_Until_Expiration BETWEEN 61 AND 90 THEN 'expiring 90d'
    ELSE 'healthy'
  END AS expiration_bucket,
  -- Join job context (community, address, current_stage)
  m.community,
  m.address,
  m.city,
  m.current_stage,
  l._extracted_at AS _refreshed_at
FROM `atomic-venture-404412.brite_homes_raw.loan_tracker` l
LEFT JOIN `atomic-venture-404412.brite_homes_raw.construction_milestones` m USING (job_id);


-- ── fact_job_metrics ───────────────────────────────────────────────────────
-- UNIONed view of the 8 per-job 2-column lookup tables. Each row is
-- (job_id, metric, value, _refreshed_at). Easier than 8 separate JOINs when
-- the bot wants to compare metrics across job(s).
CREATE OR REPLACE VIEW `atomic-venture-404412.brite_homes_marts.fact_job_metrics` AS
SELECT job_id, 'bpof_wip' AS metric, SAFE_CAST(BPOF_WIP AS FLOAT64) AS value, _extracted_at FROM `atomic-venture-404412.brite_homes_raw.bpof_wip`
UNION ALL
SELECT job_id, 'bpof_drawable_wip', SAFE_CAST(BPOF_Drawable_WIP AS FLOAT64), _extracted_at FROM `atomic-venture-404412.brite_homes_raw.bpof_drawable_wip`
UNION ALL
SELECT job_id, 'brite_assets_wip', SAFE_CAST(Brite_Assests_WIP AS FLOAT64), _extracted_at FROM `atomic-venture-404412.brite_homes_raw.brite_assets_wip`  -- sheet typo "Assests"
UNION ALL
SELECT job_id, 'brite_assets_drawable_wip', SAFE_CAST(Brite_Assests_Drawable_WIP AS FLOAT64), _extracted_at FROM `atomic-venture-404412.brite_homes_raw.brite_assets_drawable_wip`  -- sheet typo
UNION ALL
SELECT job_id, 'financing_cost', SAFE_CAST(Financing_Cost AS FLOAT64), _extracted_at FROM `atomic-venture-404412.brite_homes_raw.financing_cost`
UNION ALL
SELECT job_id, 'job_cost_on_closed', SAFE_CAST(Job_Cost_on_Closed AS FLOAT64), _extracted_at FROM `atomic-venture-404412.brite_homes_raw.job_cost_on_closed`
UNION ALL
SELECT job_id, 'lot_cost_closed', SAFE_CAST(Lot_Cost_Closed AS FLOAT64), _extracted_at FROM `atomic-venture-404412.brite_homes_raw.lot_cost_closed`
UNION ALL
SELECT job_id, 'lot_cost_lookup', SAFE_CAST(Lot_Cost AS FLOAT64), _extracted_at FROM `atomic-venture-404412.brite_homes_raw.lot_cost_lookup`;
