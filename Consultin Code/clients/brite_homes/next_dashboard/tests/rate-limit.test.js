import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit.js";

describe("checkRateLimit", () => {
  beforeEach(() => {
    globalThis.__briteHomesAskRateLimiter = undefined;
    process.env.ASK_RATE_WINDOW_MS = "60000";
    process.env.ASK_RATE_MAX = "3";
    process.env.ASK_RATE_MAX_CONCURRENT = "10"; // high so the window cap is what we hit
  });

  it("allows up to the window limit, then blocks with 429", () => {
    const ip = "1.2.3.4";
    checkRateLimit(ip).release();
    checkRateLimit(ip).release();
    checkRateLimit(ip).release();
    const blocked = checkRateLimit(ip);
    expect(blocked.ok).toBe(false);
    expect(blocked.status).toBe(429);
  });

  it("blocks when too many requests are concurrently in flight", () => {
    process.env.ASK_RATE_MAX = "100";
    process.env.ASK_RATE_MAX_CONCURRENT = "2";
    const ip = "5.6.7.8";
    const a = checkRateLimit(ip);
    const b = checkRateLimit(ip);
    const c = checkRateLimit(ip);
    expect(a.ok).toBe(true);
    expect(b.ok).toBe(true);
    expect(c.ok).toBe(false);
    a.release();
    b.release();
    expect(checkRateLimit(ip).ok).toBe(true); // slot freed
  });

  it("frees a concurrency slot on release and is idempotent", () => {
    process.env.ASK_RATE_MAX = "100";
    process.env.ASK_RATE_MAX_CONCURRENT = "1";
    const ip = "9.9.9.9";
    const a = checkRateLimit(ip);
    expect(a.ok).toBe(true);
    expect(checkRateLimit(ip).ok).toBe(false); // concurrent cap hit (no slot consumed by a blocked call)
    a.release();
    a.release(); // safe to call twice
    expect(checkRateLimit(ip).ok).toBe(true);
  });
});
