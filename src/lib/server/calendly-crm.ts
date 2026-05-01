type CalendlyQuestionAnswer = {
  question?: string;
  answer?: string | number | boolean | null;
};

type CalendlyTracking = {
  utm_campaign?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
};

export type CalendlyWebhookEvent = {
  event?: string;
  created_at?: string;
  payload?: {
    uri?: string;
    email?: string;
    name?: string;
    first_name?: string | null;
    last_name?: string | null;
    text_reminder_number?: string | null;
    status?: string | null;
    timezone?: string | null;
    event?: string | null;
    scheduled_event?: {
      uri?: string;
      name?: string;
      start_time?: string;
      end_time?: string;
    } | null;
    questions_and_answers?: CalendlyQuestionAnswer[];
    tracking?: CalendlyTracking | null;
    created_at?: string;
    updated_at?: string;
    cancel_url?: string;
    reschedule_url?: string;
  };
};

export type CrmLead = {
  source: "calendly";
  stage: "Discovery Booked" | "Discovery Canceled";
  eventName: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  homesClosedPerYear?: string;
  currentSystems?: string;
  reportingPain?: string;
  calendlyInviteeUri?: string;
  calendlyEventUri?: string;
  calendlyStatus?: string;
  scheduledAt?: string;
  timezone?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
};

type SyncResult = {
  lead: CrmLead;
  destinations: Array<{
    name: "internal_crm";
    status: "skipped" | "forwarded";
    detail?: string;
  }>;
};

function textValue(value: CalendlyQuestionAnswer["answer"]): string | undefined {
  if (value === null || value === undefined) return undefined;
  const stringValue = String(value).trim();
  return stringValue.length > 0 ? stringValue : undefined;
}

function answerByQuestion(
  answers: CalendlyQuestionAnswer[],
  keywords: string[],
): string | undefined {
  return answers
    .find((answer) => {
      const question = answer.question?.toLowerCase() ?? "";
      return keywords.some((keyword) => question.includes(keyword));
    })
    ?.answer?.toString()
    .trim();
}

function splitName(name: string): { firstName?: string; lastName?: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function normalizeCalendlyLead(webhook: CalendlyWebhookEvent): CrmLead {
  const payload = webhook.payload;
  if (!payload) {
    throw new Error("Calendly webhook payload is missing.");
  }

  const email = payload.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("Calendly invitee email is missing.");
  }

  const fullName =
    payload.name?.trim() ||
    [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim() ||
    email;
  const split = splitName(fullName);
  const firstName = payload.first_name?.trim() || split.firstName;
  const lastName = payload.last_name?.trim() || split.lastName;
  const answers = payload.questions_and_answers ?? [];
  const tracking = payload.tracking ?? {};
  const eventName = webhook.event ?? "invitee.created";
  const isCanceled =
    eventName === "invitee.canceled" || payload.status === "canceled";

  return {
    source: "calendly",
    stage: isCanceled ? "Discovery Canceled" : "Discovery Booked",
    eventName,
    name: fullName,
    firstName,
    lastName,
    email,
    phone:
      textValue(payload.text_reminder_number) ||
      answerByQuestion(answers, ["phone", "mobile", "cell"]),
    company: answerByQuestion(answers, ["company", "builder", "developer"]),
    role: answerByQuestion(answers, ["role", "title", "position"]),
    homesClosedPerYear: answerByQuestion(answers, [
      "homes",
      "units",
      "doors",
      "closed",
      "starts",
    ]),
    currentSystems: answerByQuestion(answers, [
      "system",
      "erp",
      "software",
      "spreadsheet",
    ]),
    reportingPain: answerByQuestion(answers, [
      "report",
      "pain",
      "goal",
      "problem",
      "priority",
    ]),
    calendlyInviteeUri: payload.uri,
    calendlyEventUri: payload.scheduled_event?.uri ?? payload.event ?? undefined,
    calendlyStatus: payload.status ?? undefined,
    scheduledAt: payload.scheduled_event?.start_time,
    timezone: payload.timezone ?? undefined,
    utmSource: tracking.utm_source ?? undefined,
    utmMedium: tracking.utm_medium ?? undefined,
    utmCampaign: tracking.utm_campaign ?? undefined,
    utmContent: tracking.utm_content ?? undefined,
    utmTerm: tracking.utm_term ?? undefined,
  };
}

async function forwardToInternalCrm(
  lead: CrmLead,
  rawWebhook: CalendlyWebhookEvent,
) {
  const url = process.env.CRM_INGEST_WEBHOOK_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CRM_INGEST_WEBHOOK_URL is not configured. Calendly leads would not be saved.",
      );
    }

    return {
      name: "internal_crm" as const,
      status: "skipped" as const,
      detail: "CRM_INGEST_WEBHOOK_URL is not configured.",
    };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.CRM_INGEST_WEBHOOK_SECRET
        ? { Authorization: `Bearer ${process.env.CRM_INGEST_WEBHOOK_SECRET}` }
        : {}),
    },
    body: JSON.stringify({
      type: "calendly_lead",
      lead,
      rawWebhook,
    }),
  });

  if (!response.ok) {
    throw new Error(`Internal CRM ${response.status}: ${response.statusText}`);
  }

  return {
    name: "internal_crm" as const,
    status: "forwarded" as const,
    detail: url,
  };
}

export async function syncCalendlyLead(
  webhook: CalendlyWebhookEvent,
): Promise<SyncResult> {
  const lead = normalizeCalendlyLead(webhook);
  const destinations = [await forwardToInternalCrm(lead, webhook)];

  return { lead, destinations };
}
