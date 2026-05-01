import crypto from "node:crypto";
import { NextResponse } from "next/server";
import {
  type CalendlyWebhookEvent,
  syncCalendlyLead,
} from "@/lib/server/calendly-crm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPPORTED_EVENTS = new Set(["invitee.created", "invitee.canceled"]);
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

function parseSignatureHeader(header: string): Record<string, string> {
  return Object.fromEntries(
    header
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...value] = part.split("=");
        return [key, value.join("=")] as const;
      }),
  );
}

function timingSafeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return (
    aBuffer.length === bBuffer.length &&
    crypto.timingSafeEqual(aBuffer, bBuffer)
  );
}

function verifyCalendlySignature(
  rawBody: string,
  signatureHeader: string,
): boolean {
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!signingKey) return process.env.NODE_ENV !== "production";

  const parts = parseSignatureHeader(signatureHeader);
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const timestampSeconds = Number(timestamp);
  if (
    Number.isFinite(timestampSeconds) &&
    Math.abs(Date.now() / 1000 - timestampSeconds) >
      SIGNATURE_TOLERANCE_SECONDS
  ) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", signingKey)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "calendly-crm-webhook",
    events: Array.from(SUPPORTED_EVENTS),
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("calendly-webhook-signature");

  if (!signatureHeader || !verifyCalendlySignature(rawBody, signatureHeader)) {
    return NextResponse.json(
      { ok: false, error: "Invalid Calendly webhook signature." },
      { status: 401 },
    );
  }

  let webhook: CalendlyWebhookEvent;
  try {
    webhook = JSON.parse(rawBody) as CalendlyWebhookEvent;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  if (!webhook.event || !SUPPORTED_EVENTS.has(webhook.event)) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      event: webhook.event ?? "unknown",
    });
  }

  try {
    const result = await syncCalendlyLead(webhook);
    return NextResponse.json({
      ok: true,
      event: webhook.event,
      lead: {
        email: result.lead.email,
        name: result.lead.name,
        company: result.lead.company,
        stage: result.lead.stage,
      },
      destinations: result.destinations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Calendly CRM sync failed.",
      },
      { status: 500 },
    );
  }
}
