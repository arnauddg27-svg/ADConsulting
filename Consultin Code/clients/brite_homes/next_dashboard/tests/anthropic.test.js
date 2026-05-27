import { describe, it, expect, afterEach } from "vitest";
import { resolveModel } from "@/lib/anthropic.js";

afterEach(() => { delete process.env.ANTHROPIC_MODEL; });

describe("resolveModel", () => {
  it("defaults to claude-sonnet-4-6", () => {
    expect(resolveModel()).toBe("claude-sonnet-4-6");
  });
  it("honors ANTHROPIC_MODEL override", () => {
    process.env.ANTHROPIC_MODEL = "claude-opus-4-7";
    expect(resolveModel()).toBe("claude-opus-4-7");
  });
});
