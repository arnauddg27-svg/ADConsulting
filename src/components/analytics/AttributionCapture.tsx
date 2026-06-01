"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

// Persists ad click ids + UTMs on first ad-touch so they survive into the
// Calendly booking handoff. Renders nothing; runs once after mount.
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);

  return null;
}
