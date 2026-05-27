import Anthropic from "@anthropic-ai/sdk";

let cached;

export function createAnthropicClient() {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY. Add it to next_dashboard/.env.local to enable the Ask page.");
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export function resolveModel() {
  return process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
}
