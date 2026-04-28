"use client";

import {
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  DollarSign,
  ExternalLink,
  Link2,
  Megaphone,
  MousePointerClick,
  Target,
  Users,
} from "lucide-react";
import { useState } from "react";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type CampaignStatus = "Live-ready" | "Draft" | "Needs setup";
type IntegrationStatus = "Connected" | "Ready to connect" | "Needs account access";

const baseUrl = "https://consulting.aderpsystems.com/contact/";

const metricCards = [
  {
    label: "Target monthly calls",
    value: "12",
    detail: "Booked discovery calls",
    icon: CalendarCheck,
  },
  {
    label: "Starter budget",
    value: "$4.5K",
    detail: "Suggested test budget",
    icon: DollarSign,
  },
  {
    label: "Target CPL",
    value: "$125",
    detail: "Qualified lead goal",
    icon: Target,
  },
  {
    label: "Target CPA",
    value: "$375",
    detail: "Booked call goal",
    icon: MousePointerClick,
  },
];

const campaigns: Array<{
  channel: string;
  name: string;
  audience: string;
  offer: string;
  budget: string;
  status: CampaignStatus;
}> = [
  {
    channel: "Google Search",
    name: "Builder Reporting System",
    audience: "High-intent searches for builder dashboards, ERP reporting, and construction data",
    offer: "Book a discovery call",
    budget: "$1,800/mo",
    status: "Draft",
  },
  {
    channel: "LinkedIn",
    name: "Homebuilder Ops Leaders",
    audience: "Owners, presidents, COOs, CFOs, operations leaders at residential builders",
    offer: "See sample dashboard",
    budget: "$1,800/mo",
    status: "Draft",
  },
  {
    channel: "Meta",
    name: "Sample Dashboard Retargeting",
    audience: "Website visitors and engaged audiences",
    offer: "Book a 30-minute call",
    budget: "$900/mo",
    status: "Needs setup",
  },
];

const channelRows = [
  {
    source: "google",
    spend: "$1,800",
    leads: 14,
    calls: 5,
    proposals: 2,
    target: "$360",
  },
  {
    source: "linkedin",
    spend: "$1,800",
    leads: 8,
    calls: 4,
    proposals: 2,
    target: "$450",
  },
  {
    source: "meta",
    spend: "$900",
    leads: 10,
    calls: 3,
    proposals: 1,
    target: "$300",
  },
];

const checklist = [
  "Connect Google Ads, Meta Ads, and LinkedIn Ads accounts.",
  "Use one naming convention for campaign, source, medium, and content.",
  "Send all paid traffic to the contact page or sample dashboard page.",
  "Track booked calls as the first conversion that matters.",
  "Review qualified calls, proposals, and cost per proposal weekly.",
];

const integrations: Array<{
  name: string;
  purpose: string;
  status: IntegrationStatus;
}> = [
  {
    name: "Google Ads",
    purpose: "Search campaign spend, clicks, and conversion reporting",
    status: "Ready to connect",
  },
  {
    name: "Meta Ads",
    purpose: "Facebook and Instagram retargeting performance",
    status: "Needs account access",
  },
  {
    name: "LinkedIn Ads",
    purpose: "Campaigns aimed at builder executives and operators",
    status: "Needs account access",
  },
  {
    name: "Calendly",
    purpose: "Booked discovery calls tied back to campaign source",
    status: "Ready to connect",
  },
  {
    name: "HubSpot CRM",
    purpose: "Contacts, companies, deals, and proposal tracking",
    status: "Connected",
  },
];

const pipeline = [
  {
    company: "Regional Builder A",
    source: "Google Search",
    stage: "Booked Call",
    need: "ERP data + job cost reporting",
    value: "$18K-$35K",
  },
  {
    company: "Production Builder B",
    source: "LinkedIn",
    stage: "Discovery",
    need: "Central dashboard + KPI logic",
    value: "$25K-$60K",
  },
  {
    company: "Private Builder C",
    source: "Meta Retargeting",
    stage: "Nurture",
    need: "Spreadsheet consolidation",
    value: "$12K-$25K",
  },
];

const statusStyles: Record<CampaignStatus | IntegrationStatus, string> = {
  Connected: "border-accent-400/25 bg-accent-500/12 text-accent-200",
  "Ready to connect": "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  "Needs account access": "border-amber-300/25 bg-amber-400/10 text-amber-100",
  "Live-ready": "border-accent-400/25 bg-accent-500/12 text-accent-200",
  Draft: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
  "Needs setup": "border-amber-300/25 bg-amber-400/10 text-amber-100",
};

function slug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function MarketingCommandCenter() {
  const [source, setSource] = useState("google");
  const [medium, setMedium] = useState("cpc");
  const [campaign, setCampaign] = useState("builder-data-platform");
  const [content, setContent] = useState("discovery-call");

  const trackedUrl = `${baseUrl}?utm_source=${encodeURIComponent(
    slug(source)
  )}&utm_medium=${encodeURIComponent(slug(medium))}&utm_campaign=${encodeURIComponent(
    slug(campaign)
  )}&utm_content=${encodeURIComponent(slug(content))}`;

  return (
    <div className="relative overflow-hidden pt-32 pb-20 sm:pt-36 md:pt-40">
      <Container>
        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.1] bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.045)_45%,rgba(14,165,233,0.08))] px-5 py-8 shadow-[0_40px_100px_-70px_rgba(0,0,0,1)] sm:px-8 md:px-10 md:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-accent-400/20 blur-[95px]"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <span className="eyebrow">Marketing Command Center</span>
              <h1 className="mt-6 max-w-4xl font-heading text-4xl leading-[0.95] tracking-[0.01em] text-slate-50 sm:text-5xl md:text-6xl">
                Campaign planning, lead tracking, and booked-call visibility in one place.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Lightweight V1 for Google, Meta, LinkedIn, Calendly, and HubSpot
                workflow control. This version plans and tracks campaigns before
                ad-account API publishing is turned on.
              </p>
            </div>
            <Card padding="md" className="bg-black/20">
              <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Current Mode
              </div>
              <div className="mt-3 flex items-center gap-3 text-slate-100">
                <CircleDashed className="text-cyan-300" size={24} />
                <div>
                  <div className="font-heading text-2xl">Planning + tracking</div>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    No ads launch or spend from this page yet.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} padding="md" className="bg-white/[0.035]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[0.66rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {metric.label}
                    </div>
                    <div className="mt-3 font-heading text-4xl tracking-[-0.04em] text-slate-50">
                      {metric.value}
                    </div>
                    <div className="mt-2 text-sm text-slate-400">{metric.detail}</div>
                  </div>
                  <div className="rounded-2xl border border-accent-300/20 bg-accent-500/10 p-3 text-accent-200">
                    <Icon size={20} />
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card padding="lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                  Campaigns
                </div>
                <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-slate-50">
                  Launch board
                </h2>
              </div>
              <Button href="/contact/" variant="secondary" size="sm">
                View landing page
                <ArrowUpRight size={14} />
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {campaigns.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-white/[0.08] bg-black/15 p-4 transition-colors hover:border-white/[0.16] hover:bg-white/[0.045]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-slate-300">
                          {item.channel}
                        </span>
                        <span
                          className={`rounded-full border px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.18em] ${statusStyles[item.status]}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-slate-50">
                        {item.name}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        {item.audience}
                      </p>
                    </div>
                    <div className="grid min-w-[13rem] gap-2 text-sm text-slate-300">
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Offer</span>
                        <span>{item.offer}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">Budget</span>
                        <span>{item.budget}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg" className="bg-white/[0.035]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                  Funnel
                </div>
                <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-slate-50">
                  What matters
                </h2>
              </div>
              <BarChart3 className="text-accent-300" size={26} />
            </div>
            <div className="mt-7 space-y-5">
              {[
                ["Visitors", "1,200", "Paid and retargeting traffic"],
                ["Qualified leads", "32", "Builders that match your niche"],
                ["Booked calls", "12", "Primary conversion"],
                ["Proposals", "5", "Quote-ready opportunities"],
              ].map(([label, value, helper], index) => (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-100">{label}</span>
                    <span className="font-heading text-xl text-slate-50">{value}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-500 to-cyan-300"
                      style={{ width: `${100 - index * 22}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{helper}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card padding="lg">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
              Tracking
            </div>
            <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-slate-50">
              UTM link builder
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Generate clean campaign URLs before launching ads. Use one link per
              creative, audience, or keyword group.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["Source", source, setSource, "google"],
                ["Medium", medium, setMedium, "cpc"],
                ["Campaign", campaign, setCampaign, "builder-data-platform"],
                ["Content", content, setContent, "search-ad-a"],
              ].map(([label, value, setValue, placeholder]) => (
                <label key={label as string} className="block">
                  <span className="field-label">{label as string}</span>
                  <input
                    className="field"
                    value={value as string}
                    placeholder={placeholder as string}
                    onChange={(event) =>
                      (setValue as React.Dispatch<React.SetStateAction<string>>)(
                        event.target.value
                      )
                    }
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
              <div className="mb-2 flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
                <Link2 size={14} />
                Generated URL
              </div>
              <p className="break-all font-mono text-xs leading-6 text-accent-100">
                {trackedUrl}
              </p>
            </div>
          </Card>

          <Card padding="lg">
            <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
              Performance
            </div>
            <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-slate-50">
              Channel scorecard
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[0.66rem] uppercase tracking-[0.18em] text-slate-500">
                  <tr className="border-b border-white/[0.08]">
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3 pr-4">Spend</th>
                    <th className="py-3 pr-4">Leads</th>
                    <th className="py-3 pr-4">Calls</th>
                    <th className="py-3 pr-4">Proposals</th>
                    <th className="py-3 pr-4">CPA Goal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {channelRows.map((row) => (
                    <tr key={row.source}>
                      <td className="py-4 pr-4 font-semibold capitalize text-slate-100">
                        {row.source}
                      </td>
                      <td className="py-4 pr-4">{row.spend}</td>
                      <td className="py-4 pr-4">{row.leads}</td>
                      <td className="py-4 pr-4">{row.calls}</td>
                      <td className="py-4 pr-4">{row.proposals}</td>
                      <td className="py-4 pr-4 text-accent-200">{row.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card padding="lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                  Pipeline
                </div>
                <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-slate-50">
                  Lead queue
                </h2>
              </div>
              <Users className="text-accent-300" size={26} />
            </div>
            <div className="mt-6 space-y-3">
              {pipeline.map((lead) => (
                <div
                  key={lead.company}
                  className="rounded-2xl border border-white/[0.08] bg-black/15 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-semibold text-slate-50">{lead.company}</div>
                      <div className="mt-1 text-sm text-slate-400">{lead.need}</div>
                    </div>
                    <span className="rounded-full border border-accent-300/20 bg-accent-500/10 px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-accent-200">
                      {lead.stage}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    <div>Source: {lead.source}</div>
                    <div>Project range: {lead.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                  Launch
                </div>
                <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-slate-50">
                  Setup checklist
                </h2>
              </div>
              <Megaphone className="text-accent-300" size={26} />
            </div>
            <div className="mt-6 space-y-4">
              {checklist.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-slate-300">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-accent-300" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-6">
          <Card padding="lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent-300">
                  Integrations
                </div>
                <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-slate-50">
                  Connection readiness
                </h2>
              </div>
              <a
                href="https://app-na2.hubspot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-200 transition-colors hover:text-accent-100"
              >
                Open HubSpot
                <ExternalLink size={14} />
              </a>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {integrations.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-white/[0.08] bg-black/15 p-4"
                >
                  <div className="font-semibold text-slate-50">{item.name}</div>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">
                    {item.purpose}
                  </p>
                  <span
                    className={`mt-4 inline-flex rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </Container>
    </div>
  );
}
