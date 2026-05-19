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

## Calendly Routing Form Setup

Create the public booking entry point through the website booking gate and Calendly Routing instead of sending visitors directly to the 30-minute meeting page.

The website route `https://consulting.aderpsystems.com/book/` now asks the first qualification questions before revealing Calendly. Calendly Routing should still be configured with the same logic so direct routing-form links do not bypass qualification.

1. Open Calendly.
2. Go to Routing.
3. Select New routing form.
4. Choose Create a new form.
5. Name the form:

```text
Consultation Request
```

6. Add these questions:

| Question | Type | Answers |
| --- | --- | --- |
| Country | Radio button | United States, Canada, Other |
| Company type | Radio button | Residential builder, Residential real estate developer, Residential land developer, Other |
| Approx. homes or units per year | Radio button | Under 20, 20-99, 100-499, 500+, Not sure, Not applicable |
| Current systems | Checkboxes | ERP, Spreadsheets, Finance system, APIs or exports, Operating tools, Not sure yet |
| Company name | Short answer | |
| Company website | Short answer | |
| Business email | Email address | |
| Phone number | Phone number | |
| What are you looking to discuss? | Paragraph | |

7. Set the routing logic:

| Condition | Destination | Message |
| --- | --- | --- |
| Country = Other | Custom message | Thank you. At this time, we only schedule consultations for U.S. and Canada-based companies. |
| Company type = Other | Custom message | Thank you. This calendar is for residential builders and developers. |
| Approx. homes or units per year = Not applicable | Custom message | Thank you. This does not appear to be a fit for the discovery calendar. |
| Country = United States or Canada, company type is residential builder/developer/land developer, and volume is not Not applicable | Event type | 30 Minute Meeting |

8. Preview the form and test the main paths:
   - Country = Other should show the U.S./Canada message.
   - Company type = Other should show the residential builders/developers message.
   - Volume = Not applicable should show the not-a-fit message.
   - Qualified U.S./Canada builder/developer answers should show the 30 Minute Meeting booking page.
9. Publish the form.
10. Copy the published routing form share link.
11. Set `NEXT_PUBLIC_CALENDLY_ROUTING_FORM_URL` in Vercel to the published routing form URL.

The website uses `NEXT_PUBLIC_CALENDLY_ROUTING_FORM_URL` after the `/book/` qualification gate. If it is not set locally, the app falls back to the direct 30-minute link for development only.

## Calendly Webhook Setup

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

## Recommended Calendly Event Questions

Keep the 30-minute meeting form light because the Routing form now does the qualification work. If you need additional CRM detail, collect it in the Routing form first so disqualified visitors do not reach the booking page.

## QA Test

After deployment:

1. Visit `https://consulting.aderpsystems.com/api/calendly/webhook`.
2. Confirm it returns `ok: true`.
3. Book a test Calendly meeting.
4. Confirm the lead appears in the internal CRM.
5. Confirm UTMs are attached when booking from an ad URL.
