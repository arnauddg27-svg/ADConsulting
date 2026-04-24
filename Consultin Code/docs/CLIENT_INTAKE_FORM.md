# Client Intake Form — A.D. Homes & Consulting

> **Instructions:** Fill out one form per builder engagement. Replace `[ ]` with `[x]` for checked items. Replace `____` with the relevant value. Email completed form to your A.D. Homes contact, or share via Google Doc / printed PDF. We use this to plan week 1 of your build, so the more you can fill in, the faster we can move.
>
> Estimated time to complete: **30–45 minutes** with input from operations, finance, and IT.

---

## 1. Company Profile

**Legal entity name:** ____________________________________

**DBA / brand name:** ____________________________________

**Primary state(s) of operation:** ____________________________________

**Number of homes closed last 12 months:** ______

**Number of homes currently in flight (started but not closed):** ______

**Number of communities / subdivisions actively selling:** ______

**Number of distinct legal entities under your umbrella:** ______ (single LLC vs holding company structure)

**Annual revenue (range):**
- [ ] Under $20M
- [ ] $20M – $50M
- [ ] $50M – $100M
- [ ] $100M – $250M
- [ ] $250M+

---

## 2. Source Systems Inventory

> Check every system your team uses. We'll integrate all of them. Add notes on which department owns each.

### 2.1 Construction / Job Management ERP

| System | Use it? | Department contact | Approximate user count |
|---|---|---|---|
| NewStar (Constellation) | [ ] | __________ | ____ |
| Hyphen HomeFront / BRIX | [ ] | __________ | ____ |
| BuilderMT | [ ] | __________ | ____ |
| BuilderTrend | [ ] | __________ | ____ |
| CoConstruct | [ ] | __________ | ____ |
| Procore | [ ] | __________ | ____ |
| BuildPro | [ ] | __________ | ____ |
| Mark Systems / FAST | [ ] | __________ | ____ |
| Custom / homegrown | [ ] | __________ | ____ |
| **Other:** ______________ | [ ] | __________ | ____ |

**Where does this system live?**
- [ ] Cloud SaaS (vendor-hosted)
- [ ] Server in our office / colocation
- [ ] Server in Azure / AWS / GCP
- [ ] Don't know — IT can confirm

**Database engine (if known):** [ ] SQL Server  [ ] Oracle  [ ] PostgreSQL  [ ] MySQL  [ ] Other: ______

### 2.2 Financial Systems

| System | Use it? | Notes |
|---|---|---|
| QuickBooks Online | [ ] | __________ |
| QuickBooks Desktop | [ ] | __________ |
| Sage 300 CRE | [ ] | __________ |
| Sage Intacct | [ ] | __________ |
| NetSuite | [ ] | __________ |
| Foundation Software | [ ] | __________ |
| Xero | [ ] | __________ |
| **Other:** ______________ | [ ] | __________ |

### 2.3 CRM / Sales Pipeline

| System | Use it? | Notes |
|---|---|---|
| Salesforce | [ ] | __________ |
| HubSpot | [ ] | __________ |
| Lasso CRM | [ ] | __________ |
| Builder ERP (CRM module) | [ ] | __________ |
| Spreadsheets only | [ ] | __________ |
| **Other:** ______________ | [ ] | __________ |

### 2.4 Property Management (if you operate rentals)

| System | Use it? | Notes |
|---|---|---|
| AppFolio | [ ] | __________ |
| Buildium | [ ] | __________ |
| RentVine | [ ] | __________ |
| Yardi | [ ] | __________ |
| Spreadsheets only | [ ] | __________ |
| Don't operate rentals | [ ] | __________ |
| **Other:** ______________ | [ ] | __________ |

### 2.5 Spreadsheets Used Operationally

> List every Google Sheet or Excel workbook your team relies on for tracking that lives **outside** the ERP. Most builders have 5–15 of these. Examples: weekly construction status, land acquisition pipeline, exception logs, commission calculations.

| Spreadsheet name | Where it lives | Owner | Update frequency |
|---|---|---|---|
| Example: Land Acquisition WIP | OneDrive — Operations folder | Mike (Land Acquisition) | Weekly |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |
| ____________________ | [ ] OneDrive  [ ] Google Drive  [ ] SharePoint  [ ] Local | __________ | __________ |

### 2.6 Other Data Sources

- [ ] Construction loans tracked in a bank portal — bank: __________
- [ ] Permits tracked in county portals — counties: __________
- [ ] MLS / RETS feed for sales comps — provider: __________
- [ ] Email-attached weekly reports — describe: __________
- [ ] Other: __________

---

## 3. Stakeholders & Decision Makers

| Role | Name | Email | Phone | Notes |
|---|---|---|---|---|
| **Executive sponsor** (signs off on dashboards) | __________ | __________ | __________ | __________ |
| **Operations lead** (cycle time, schedule, exceptions) | __________ | __________ | __________ | __________ |
| **Finance lead** (P&L, WIP, margins) | __________ | __________ | __________ | __________ |
| **IT contact** (provisions database access, Azure AD) | __________ | __________ | __________ | __________ |
| **Sales / closings lead** | __________ | __________ | __________ | __________ |
| **Property mgmt lead** (if applicable) | __________ | __________ | __________ | __________ |
| **Day-to-day point of contact** | __________ | __________ | __________ | __________ |

---

## 4. Access Provisioning

> This section is what your IT team needs to prepare. We provide step-by-step runbooks for each item; this just tracks status.

### 4.1 Google Cloud (for the warehouse + dashboard hosting)

- [ ] We have a Google Cloud account already (project name: __________)
- [ ] We need A.D. Homes to spin one up for us (you'll get owner access at handoff)

### 4.2 Microsoft / Azure (for OneDrive xlsx access, if applicable)

- [ ] We use Microsoft 365 / OneDrive for Business — tenant: __________
- [ ] Our IT can register an Azure AD app with `Files.Read.All` permission (we provide the runbook)
- [ ] We don't use OneDrive — skip this section

### 4.3 ERP database access (if your ERP runs on a server you control)

- [ ] Our ERP is cloud-hosted (no DB access needed)
- [ ] Our ERP runs on our server — IT can provide:
  - [ ] Read-only database user
  - [ ] VPN credentials OR SSH tunnel OR IP allowlist
  - [ ] Read-replica or scheduled backup we can read from (preferred over production)
  - [ ] List of relevant schemas / tables (we'll do the deep audit)

### 4.4 Fivetran tenant

- [ ] Register a Fivetran account in our company name (free tier, you provide the setup steps)
- [ ] We already have a Fivetran account — admin contact: __________

### 4.5 Vercel hosting

- [ ] Register a Vercel account in our company name for the dashboard
- [ ] We already have a Vercel account — admin contact: __________

### 4.6 Domain for the dashboard

**Preferred URL:** ____________________________________
*(e.g., `data.acmehomes.com`, `dashboard.acmehomes.com`)*

- [ ] We control the domain and can add a DNS record
- [ ] We need help with DNS

---

## 5. Sample Data

> The fastest way for us to scope your engagement accurately is to see real data shapes. We sign an NDA before this step. Anonymize names if needed; we care about structure, not specific records.

Please provide one or more of:

- [ ] Recent xlsx export from ERP (1 month of data is plenty)
- [ ] Sample of operational spreadsheets (the 5–15 you listed in section 2.5)
- [ ] Schema dump from ERP database (table list + column names)
- [ ] Sample API response from QuickBooks / Salesforce / etc.
- [ ] Screenshot or export of any dashboard / report you currently use

**Where will you upload these?**
- [ ] We'll send via shared Google Drive folder you provide
- [ ] We'll upload to a Box / Dropbox link you provide
- [ ] Email attachment (under 25 MB)

---

## 6. KPI & Dashboard Priorities

> Rank by importance. We use this to decide which tabs to build first if we hit a delivery constraint.

### 6.1 What does your team most need visibility into right now?

Rank 1 (most important) to 7 (least). Skip rows that don't apply.

| Priority | Domain | Notes |
|---|---|---|
| ____ | **Construction** — cycle time, stage stalls, super workload, completion % | __________ |
| ____ | **Cost / Margin** — budget vs actual, WIP, per-job P&L, audits | __________ |
| ____ | **Sales** — pipeline, closings, absorption rate, plan performance | __________ |
| ____ | **Loans** — exposure, draw %, expirations, lender concentration | __________ |
| ____ | **Land Acquisition** — pipeline, subdivision phases, deals | __________ |
| ____ | **Permits** — applications in flight, stuck permits, by city | __________ |
| ____ | **Property Management** — occupancy, delinquency, rent roll | __________ |

### 6.2 What's the #1 question your dashboard should answer at 8am every Monday?

____________________________________________________________________________

____________________________________________________________________________

### 6.3 What reports do you produce manually today that we should automate?

| Report name | How long does it take to make? | Frequency | Owner |
|---|---|---|---|
| ____________________ | __ hours | [ ] Weekly  [ ] Monthly  [ ] Quarterly | __________ |
| ____________________ | __ hours | [ ] Weekly  [ ] Monthly  [ ] Quarterly | __________ |
| ____________________ | __ hours | [ ] Weekly  [ ] Monthly  [ ] Quarterly | __________ |
| ____________________ | __ hours | [ ] Weekly  [ ] Monthly  [ ] Quarterly | __________ |

### 6.4 Custom thresholds / rules unique to your operation

> Examples: "We flag jobs as 'stuck' after 45 days in one stage, not 30." Or: "We target 12% margin on entry-level homes, 18% on premium."

| Metric | Your threshold |
|---|---|
| __________ | __________ |
| __________ | __________ |
| __________ | __________ |

---

## 7. Engagement Scope & Timeline

### 7.1 Tier preference

- [ ] **Minimal** — Construction + Sales + Audits (4–5 tabs) — 4 weeks — $25K–$45K
- [ ] **Typical** — 8–9 tabs across 5 sections — 6 weeks — $50K–$85K
- [ ] **Full** — All 12 tabs incl. Land + Property Mgmt — 8 weeks — $90K–$140K
- [ ] **Custom** — Discuss in kickoff call

### 7.2 Target go-live date

**Ideal date:** __________ (kickoff is typically 1 week after contract signing)

**Hard deadline (if any):** __________ — reason: __________

### 7.3 Existing infrastructure budget

- [ ] We're starting fresh, no existing data infra
- [ ] We have some infra (BigQuery / Snowflake / etc.) — describe: __________
- [ ] We have an existing dashboard we want to replace — describe: __________

### 7.4 Ongoing care preference

After delivery, would you like a monthly retainer for KPI tuning, schema-drift fixes, new metric additions, and alert routing?

- [ ] Yes — quote me on the $3K–$6K/mo retainer
- [ ] Maybe — let's revisit at delivery
- [ ] No — we'll handle ongoing maintenance ourselves

---

## 8. Compliance & Security

- [ ] Our data must stay in a specific region: __________
- [ ] We have specific compliance requirements (SOC 2, HIPAA, etc.): __________
- [ ] Our IT requires VPN access for any database connection: [ ] Yes  [ ] No
- [ ] We require single sign-on (SSO / SAML) on the dashboard: [ ] Yes  [ ] No — provider: __________
- [ ] We need audit logging on dashboard access: [ ] Yes  [ ] No

---

## 9. Final Notes

**Anything else we should know before kickoff?**

____________________________________________________________________________

____________________________________________________________________________

____________________________________________________________________________

**Best phone number for kickoff scheduling:** __________

**Best email for ongoing project updates:** __________

---

## What happens next

1. **You return this form** (email, shared Doc, or printed PDF) — we read it within 1 business day
2. **30-min scoping call** — we walk through your form, clarify any blanks, confirm tier
3. **SOW + agreement** — fixed-price contract issued within 2 business days of scoping call
4. **Kickoff** — typically 1 week after contract signing
5. **Week 1: discovery & access** — your IT provisions DB access + Azure AD app per our runbooks; we profile your data
6. **Weeks 2–6 (or 2–8): build** — warehouse, KPI logic, dashboards, drill-downs
7. **Week 7+: review & cutover** — three calibration sessions (ops, finance, exec); you sign off; we transfer accounts to your name

If you have questions while filling this out, email **arnauddg27@gmail.com** or call **(407) 840-1368**.

---

*Form version: 2026-04 · Pair this with `CLIENT_FACING_BRIEF.md` for the engagement overview*
