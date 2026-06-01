// Ad attribution capture + Calendly URL builder.
//
// Problem this solves: a paid click lands on the site with ?gclid=...&utm_*,
// but by the time the visitor reaches Calendly (a different domain) that
// attribution is gone — so booked calls show up as "website / referral" and
// can't be tied back to the Google/LinkedIn click that produced them.
//
// Fix: on the first ad-touch page load we persist the click ids + UTMs in a
// first-party cookie, then forward them into the Calendly booking URL. Calendly
// passes utm_* + salesforce_uuid through to its booking webhook, so the values
// land in the CRM — and the gclid can be re-imported into Google Ads as an
// offline conversion once a booked call becomes real pipeline.

const COOKIE_NAME = "ad_attribution";
const COOKIE_MAX_AGE_DAYS = 90;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

// Click identifiers from each ad platform. gclid/gbraid/wbraid are Google's;
// the rest let us extend the same plumbing to LinkedIn / Meta / Microsoft later.
const CLICK_ID_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "li_fat_id",
  "msclkid",
] as const;

const TRACKED_KEYS = [...UTM_KEYS, ...CLICK_ID_KEYS] as const;

type TrackedKey = (typeof TRACKED_KEYS)[number];

export type Attribution = Partial<Record<TrackedKey, string>> & {
  landing_page?: string;
  captured_at?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : null;
}

function writeCookie(name: string, value: string, maxAgeDays: number): void {
  if (typeof document === "undefined") return;
  const maxAge = maxAgeDays * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

/**
 * Read ad params from the current URL and, if this is an ad-touch (any click id
 * or UTM present), persist them. Organic navigation leaves the stored value
 * untouched so the original ad attribution survives the visit. Last ad-touch
 * wins — the click that most recently drove the visitor is the one credited.
 *
 * Safe to call on every page load. No-op on the server and when no ad params
 * are present.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const incoming: Attribution = {};
  for (const key of TRACKED_KEYS) {
    const value = params.get(key);
    if (value) incoming[key] = value;
  }

  const isAdTouch = TRACKED_KEYS.some((key) => incoming[key]);
  if (!isAdTouch) return;

  incoming.landing_page = window.location.pathname;
  incoming.captured_at = new Date().toISOString();

  try {
    writeCookie(
      COOKIE_NAME,
      encodeURIComponent(JSON.stringify(incoming)),
      COOKIE_MAX_AGE_DAYS,
    );
  } catch {
    // Cookies disabled — attribution simply won't persist for this visitor.
  }
}

/** Read the persisted attribution. Returns {} on the server or when none stored. */
export function getStoredAttribution(): Attribution {
  const raw = readCookie(COOKIE_NAME);
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as Attribution;
  } catch {
    return {};
  }
}

/**
 * Build a Calendly booking URL carrying the visitor's ad attribution.
 *
 * - Real ad UTMs win; absent those we fall back to website / referral so the
 *   field is never empty.
 * - utm_content carries the ad's own content when present, otherwise the
 *   on-page CTA `source` (e.g. "book_page", "hero") so we still know which
 *   button was clicked.
 * - The Google click id is forwarded via Calendly's `salesforce_uuid`
 *   passthrough, which Calendly includes in the booking webhook's tracking
 *   object — that's what lets a booked call be imported back into Google Ads.
 *
 * Falls back to the bare base URL if it can't be parsed. Client-only (reads the
 * attribution cookie); call it from a click handler or a post-mount effect to
 * avoid SSR/hydration mismatches.
 */
export function buildCalendlyUrl(baseUrl: string, source: string): string {
  let url: URL;
  try {
    url = new URL(baseUrl);
  } catch {
    return baseUrl;
  }

  const attr = getStoredAttribution();

  url.searchParams.set("utm_source", attr.utm_source ?? "website");
  url.searchParams.set("utm_medium", attr.utm_medium ?? "referral");
  if (attr.utm_campaign) url.searchParams.set("utm_campaign", attr.utm_campaign);
  url.searchParams.set("utm_content", attr.utm_content ?? source);
  if (attr.utm_term) url.searchParams.set("utm_term", attr.utm_term);

  const clickId = attr.gclid ?? attr.gbraid ?? attr.wbraid;
  if (clickId) url.searchParams.set("salesforce_uuid", clickId);

  return url.toString();
}
