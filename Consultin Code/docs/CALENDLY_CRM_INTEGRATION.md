# Calendly to CRM Integration

Calendly bookings should create or update the lead record automatically so booked calls do not rely on manual entry.

## What Was Added

- Webhook endpoint: `https://consulting.aderpsystems.com/api/calendly/webhook`
- Supported Calendly events:
  - `invitee.created`
  - `invitee.canceled`
- CRM destination:
  - Internal CRM forwarding through `CRM_INGEST_WEBHOOK_URL`.

## Hosting Requirement

This webhook requires server-capable hosting such as Vercel/Next serverless routes. It will not work as a pure static export because Calendly needs to call a live API endpoint.

## Captured Lead Fields

- Name
- First name
- Last name
- Email
- Phone
- Company
- Role/title
- Homes closed per year
- Current systems
- Main reporting pain
- Calendly invitee URI
- Calendly event URI
- Booking status
- Timezone
- UTM source, medium, campaign, content, and term
- Lead stage: `Discovery Booked` or `Discovery Canceled`

Calendly only sends optional fields if they are collected on the event form or included in the booking URL tracking parameters.

## Required Environment Variables

Set these in Vercel before turning on the webhook:

```bash
CALENDLY_WEBHOOK_SIGNING_KEY=
CRM_INGEST_WEBHOOK_URL=
CRM_INGEST_WEBHOOK_SECRET=
```

`CRM_INGEST_WEBHOOK_URL` is required in production. If it is missing, the webhook fails instead of accepting a Calendly booking and dropping the lead.

## Calendly Setup

1. Open Calendly Developer settings.
2. Create a webhook subscription.
3. Use this URL:

```text
https://consulting.aderpsystems.com/api/calendly/webhook
```

4. Subscribe to:

```text
invitee.created
invitee.canceled
```

5. Copy Calendly's webhook signing key into `CALENDLY_WEBHOOK_SIGNING_KEY`.

## Internal CRM Setup

1. Create or confirm the CRM lead-ingest endpoint.
2. Set `CRM_INGEST_WEBHOOK_URL` to that endpoint in Vercel.
3. If the CRM endpoint requires a bearer token, set `CRM_INGEST_WEBHOOK_SECRET`.
4. Confirm the CRM endpoint accepts this payload:

```json
{
  "type": "calendly_lead",
  "lead": {
    "source": "calendly",
    "stage": "Discovery Booked",
    "name": "Example Lead",
    "email": "lead@example.com",
    "company": "Example Builder"
  },
  "rawWebhook": {}
}
```

## Recommended Calendly Questions

Add these to the 30-minute meeting form so the CRM record is useful:

- Company
- Role/title
- Homes closed or units managed per year
- Current ERP or core systems
- Main reporting problem

## QA Test

After deployment:

1. Visit `https://consulting.aderpsystems.com/api/calendly/webhook`.
2. Confirm it returns `ok: true`.
3. Book a test Calendly meeting.
4. Confirm the lead appears in the internal CRM.
5. Confirm UTMs are attached when booking from an ad URL.
