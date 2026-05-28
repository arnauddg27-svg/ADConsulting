// Lightweight in-memory per-IP rate limiter for the internal Ask endpoint.
// NOTE: state is per-server-instance (not shared across serverless instances) — adequate
// for an internal/local tool. Limits are read from env at call time so they're tunable.

const KEY = "__briteHomesAskRateLimiter";

function store() {
  if (!globalThis[KEY]) globalThis[KEY] = new Map(); // ip -> { hits: number[], active: number }
  return globalThis[KEY];
}

export function checkRateLimit(ip) {
  const windowMs = Number(process.env.ASK_RATE_WINDOW_MS) || 5 * 60 * 1000;
  const maxInWindow = Number(process.env.ASK_RATE_MAX) || 20;
  const maxConcurrent = Number(process.env.ASK_RATE_MAX_CONCURRENT) || 3;

  const now = Date.now();
  const map = store();
  const rec = map.get(ip) || { hits: [], active: 0 };
  rec.hits = rec.hits.filter((t) => now - t < windowMs);

  if (rec.active >= maxConcurrent) {
    map.set(ip, rec);
    return { ok: false, status: 429, reason: "Too many requests in flight. Wait for the current answer to finish." };
  }
  if (rec.hits.length >= maxInWindow) {
    map.set(ip, rec);
    const retryS = Math.ceil((windowMs - (now - rec.hits[0])) / 1000);
    return { ok: false, status: 429, reason: `Rate limit reached (${maxInWindow} per ${Math.round(windowMs / 60000)} min). Try again in ${retryS}s.` };
  }

  rec.hits.push(now);
  rec.active += 1;
  map.set(ip, rec);

  let released = false;
  return {
    ok: true,
    release: () => {
      if (released) return; // idempotent — safe to call on every exit path
      released = true;
      const r = map.get(ip);
      if (r) r.active = Math.max(0, r.active - 1);
    },
  };
}
