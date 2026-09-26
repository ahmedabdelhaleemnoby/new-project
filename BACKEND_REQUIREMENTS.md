# Backend requirements — Asfour M&R

Status: planning document. The requirements below are not implemented.

Active project: `/Users/ahmedabuzyad/Developer/asfour-next`.

## 1. What exists today

| Feature | Current implementation | Backend work needed |
| --- | --- | --- |
| Contact and product enquiries | Browser validation followed by a `mailto:` draft; visitor sends the email manually | Direct submission, durable storage, notification delivery, and staff access |
| Career enquiries | The same form with optional company; CVs can be attached manually in the visitor’s email app | Separate enquiry routing and restricted access for HR |
| Product catalogue | Nine product families and grades defined in `src/lib/data.ts` | None for the current static catalogue; administration is a later phase |
| Product search and filters | Client-side filtering of the existing catalogue | None at the current catalogue size |
| Company pages and industries | Content in the repository | Optional CMS if staff need to edit content without code changes |
| Images and technical datasheets | Local images and links to published Asfour PDFs | Optional managed media storage and document versioning |
| Orders, tracking, payments, customer accounts | Not implemented | Separate business requirements and integrations before development |

The first release should support reliable direct enquiries. A separate backend application is not required for this scope: the existing Next.js app can expose Route Handlers under `src/app/api/`. Choose hosting, database, and email services before implementation; no provider is selected by this document.

## 2. First release: enquiry backend

### A. Submission endpoint

- [ ] Implement `POST /api/enquiries` for sales, technical, and career enquiries.
- [ ] Accept an explicit enquiry `type`; never infer routing from editable product text or the `?product=` query parameter.
- [ ] Treat every submitted field as untrusted and validate it on the server.
- [ ] Save accepted enquiries before returning success to the visitor.
- [ ] Return an opaque reference that staff can use to locate the enquiry. The reference alone must not grant access to its contents.

Proposed request:

```json
{
  "type": "sales",
  "name": "Example Buyer",
  "email": "buyer@example.com",
  "company": "Example Industries",
  "phone": "+20 ...",
  "productSlug": "lightweight-bricks",
  "topic": "Lightweight bricks",
  "message": "Please advise on a suitable grade for our application."
}
```

Send a generated UUID in the `Idempotency-Key` header. Reuse that key when retrying the same submission. Store a payload fingerprint with the key: a repeat with the same payload returns the original result; reuse with a different payload returns a conflict. Enforce uniqueness in storage so concurrent requests cannot create duplicate records.

| Field | Validation |
| --- | --- |
| `type` | Required; `sales`, `technical`, or `career` |
| `name` | Required after trimming; maximum 120 characters |
| `email` | Required; valid email address; maximum 254 characters |
| `company` | Required for sales and technical enquiries; optional for careers; maximum 160 characters |
| `phone` | Optional; maximum 50 characters; accept international formatting |
| `productSlug` | Optional; must match a known product family when provided |
| `topic` | Optional free text; maximum 160 characters; also supports industry and installation enquiries |
| `message` | Required after trimming; maximum 4,000 characters |

The limits above preserve the existing form limits. Validate request content type, reject malformed JSON and unexpected privileged fields, and set a request-body size limit that accommodates these fields. Use the server’s timestamp and initial workflow status; do not accept staff assignment, recipient addresses, delivery state, or creation time from the public client.

Proposed successful response, after the database transaction commits:

```json
{
  "reference": "ENQ-<opaque-reference>",
  "status": "received"
}
```

| HTTP status | Meaning | Frontend behaviour |
| --- | --- | --- |
| `201` | New enquiry saved | Show confirmation and reference |
| `200` | Existing result for an idempotent retry | Show the original confirmation |
| `400` / `415` | Malformed JSON / unsupported content type | Show a safe request error |
| `422` | Invalid fields | Display field-specific messages and retain input |
| `409` | Idempotency key reused with different content | Explain the conflict and allow a deliberate new submission |
| `413` | Request too large | Explain the size limit |
| `429` | Submission rate exceeded | Show retry guidance; honour `Retry-After` |
| `503` | Submission could not be saved | Retain input and allow retry; do not show success |

Use a consistent error shape such as `{ "error": { "code": "VALIDATION_ERROR", "message": "Check the highlighted fields.", "fields": { "email": "Enter a valid email address." } } }`. Never expose stack traces, credentials, or submitted personal data in errors.

### B. Storage and notification delivery

- [ ] Create versioned database migrations and durable enquiry storage.
- [ ] Store the enquiry and a notification job in one transaction, or use an equivalent durable queue arrangement that cannot lose accepted submissions.
- [ ] Send notifications using a verified business sender. Put the validated visitor address in `Reply-To`; do not let visitors set the sender or recipients.
- [ ] Configure sales/technical and HR destinations separately. Both current email drafts target `sales@asfourmr.com`; an HR recipient still needs confirmation.
- [ ] Process delivery jobs through a persistent worker or scheduled runner. Do not rely on unawaited work after a server request finishes.
- [ ] Track attempts and retry temporary failures with bounded backoff. Surface exhausted retries to staff and provide a controlled retry action.
- [ ] Deduplicate job execution and use provider idempotency support where available. Distinguish provider acceptance from actual email delivery.
- [ ] If delivery webhooks are used, verify their signatures and deduplicate events.

An email failure must not delete or hide an enquiry that was already saved. The visitor’s confirmation should say the enquiry was received, rather than claiming that an email was delivered. A visitor acknowledgement email is optional and needs its own delivery handling and abuse limits.

Suggested minimum records:

| Record | Main fields |
| --- | --- |
| `Enquiry` | Internal ID, opaque reference, type, name, email, company, phone, optional product slug, topic, message, workflow status, created/updated timestamps, optional assignee |
| `SubmissionKey` | Unique idempotency key, payload fingerprint, enquiry ID, creation and expiry timestamps |
| `NotificationJob` | Enquiry ID, recipient group, state, attempt count, next attempt time, provider message ID, redacted last error |
| `StaffAccess` | Identity-provider user ID and allowed roles; needed if a custom staff area is built |
| `AuditEvent` | Staff actor, enquiry ID, action, timestamp; avoid duplicating message bodies |

Keep workflow status (`new`, `in_progress`, `closed`, `spam`) separate from notification status (`pending`, `provider_accepted`, `delivered`, `failed`). Only use `delivered` when a verified provider event supports it.

### C. Staff access

Use either an existing approved CRM or a protected staff area. One is required so accepted enquiries remain accessible even when email fails.

- [ ] Staff can list, filter, and open enquiries, update workflow status, and assign follow-up.
- [ ] Restrict sales staff to permitted enquiries and career records to HR or specifically authorized staff.
- [ ] Check authorization on every server read and mutation, not just in navigation or page rendering.
- [ ] Use managed staff authentication or the company’s existing identity provider, secure sessions, and MFA support.
- [ ] Keep public enquiry lookup/list/export endpoints unavailable.
- [ ] Record meaningful staff changes and restrict export/deletion privileges. If CSV export is offered, neutralize spreadsheet formulas in user-entered values.

For a custom staff area, proposed protected endpoints are `GET /api/admin/enquiries`, `GET /api/admin/enquiries/[id]`, and `PATCH /api/admin/enquiries/[id]`. Paginate lists and define allowlisted filters and editable fields. A CRM integration may provide these workflows without a new admin UI.

### D. Abuse controls and data handling

- [ ] Add server-side rate limits backed by shared storage so multiple application instances enforce the same rules.
- [ ] Add a honeypot or equivalent basic spam control; use server-verified bot challenges if needed.
- [ ] Validate allowed origins for public submissions. Apply CSRF protection to authenticated mutations when cookie sessions are used.
- [ ] Escape user-entered text in email templates and staff views. Do not render submitted HTML.
- [ ] Add a clear notice explaining how contact and career information will be used.
- [ ] Define enquiry and career-record retention, deletion, backup retention, and who can access each category.
- [ ] Keep message bodies, contact details, and credentials out of routine logs; use reference IDs for troubleshooting.
- [ ] Store secrets on the server and keep them out of source control and `NEXT_PUBLIC_*` variables.

## 3. Frontend integration changes

| File | Required change |
| --- | --- |
| `src/components/contact-form.tsx` | Submit to the API; add pending, received, validation, rate-limit, and failure states; preserve input on failures; manage idempotency keys |
| `src/app/contact/page.tsx` | Pass explicit enquiry type and optional stable product reference; validate prefill values; add the agreed data-use notice |
| `src/app/products/[slug]/page.tsx` | Include the product slug in enquiry links, alongside any display text |
| `src/app/careers/page.tsx` | Link to an explicit career enquiry and replace wording about email drafts; do not promise CV uploads until implemented |
| `tests/site.spec.ts` | Replace email-draft assertions with API submission tests and add failure, retry, and career-routing coverage |

Keep the visitor’s values when a request fails. Disable repeated submission while a request is pending, but rely on server idempotency for duplicate prevention. Reset the form only after confirmed acceptance. Keep the existing email contact links as an alternative contact method.

## 4. Optional later phases

These features need separate scope decisions and are not required for direct enquiries.

| Feature | Backend requirements |
| --- | --- |
| Product and content administration | Product-family, grade, industry, page, and media records; staff permissions; draft/publish workflow; revision history; cache refresh after publishing |
| Catalogue migration | Seed the existing nine families; preserve URLs; model grade-specific datasheets accurately; keep published content available during migration |
| Document and image management | Managed storage, validated uploads, publication permissions, document versions, and reliable download URLs |
| Vacancies and CV submissions | Job records and application status; private CV storage; file size/type validation, malware handling, authorized downloads, and retention/deletion rules |
| CRM integration | Field mapping, durable synchronization, retry/deduplication, and agreed ownership of record updates |
| Quotes, order placement, and tracking | Agree the commercial workflow, customer identity, item/quantity/unit data, approval steps, and ERP/order source of truth; show real statuses only |
| Customer portal | Customer authentication, account ownership, authorization per quote/order/document, and account recovery |
| Public order lookup | Authorized access or a strong private tracking token; an order number alone must not reveal customer or shipment details |
| Arabic content | Translated content fields, locale handling, fallback/publishing rules, and corresponding frontend RTL work |
| Newsletter | Subscription management, confirmation/preferences, and unsubscribe handling; there is no newsletter form in the current build |
| Payments | Separate approval, provider integration, verified webhooks, and reconciliation; not needed for the current enquiry site |

The current catalogue does not require public product APIs or a search service. If content moves to a database, Server Components can read it on the server; add public APIs only for a defined consumer. Publication and cache handling must allow new product slugs to appear without stale catalogue or detail pages.

## 5. Configuration and deployment

Proposed server configuration names; adapt them to the chosen services:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Durable database connection |
| `EMAIL_API_KEY` | Server-side email delivery credential |
| `EMAIL_FROM` | Verified sender identity |
| `SALES_NOTIFICATION_EMAIL` | Approved sales/technical destination |
| `HR_NOTIFICATION_EMAIL` | Approved career destination |
| `APP_URL` | Canonical application URL |
| Provider-specific auth secrets | Staff authentication, if a custom staff area is built |
| Provider-specific queue/rate-limit secrets | Durable notification processing and shared abuse controls |
| `EMAIL_WEBHOOK_SECRET` | Required only if email delivery webhooks are implemented |

- [ ] Provide an `.env.example` with placeholders and setup instructions; never commit real credentials.
- [ ] Configure separate development, staging, and production data and credentials. Route staging emails to test recipients.
- [ ] Configure and verify the sending domain’s required DNS records with the selected email provider.
- [ ] Include migrations, deployment, rollback, and notification-worker setup in the runbook.
- [ ] Add redacted error monitoring, notification-failure alerts, health checks, automated backups, and a tested restore procedure.
- [ ] Document service owners and who responds to failed submissions or delivery jobs.
- [ ] Review production metadata and remove preview-only `noindex` in `src/app/layout.tsx` when the site is approved for public launch.

## 6. Inputs needed before implementation

1. Approved email sender/domain, sales and HR recipients, and access to the chosen delivery service.
2. Hosting and durable database arrangements, including backup ownership.
3. Existing CRM versus custom staff area, staff identities, and permissions.
4. Agreed enquiry/career retention and deletion rules.
5. Whether CMS editing, CV uploads, or order integration are part of this release. If orders are included, identify the existing order system and available integration.

## 7. Implementation order and acceptance checklist

1. Confirm the inputs above and document the API contract.
2. Add database migrations, validated intake, and transactional notification jobs.
3. Connect email delivery and the staff/CRM workflow.
4. Replace the mailto form flow and update page copy.
5. Verify failure handling in staging, then deploy and monitor.

The first release is ready when:

- [ ] Valid sales, technical, and career enquiries are stored and routed correctly; career enquiries can omit company.
- [ ] Tampered or invalid requests fail server validation even if browser checks are bypassed.
- [ ] Duplicate and concurrent retries return the same enquiry reference without duplicate records or notification jobs.
- [ ] Database failures never produce a success confirmation; visitor input survives a failed request.
- [ ] Notification failures preserve accepted enquiries, trigger retries, and become visible to staff.
- [ ] Unauthorized users cannot list, read, export, or change enquiries; sales staff cannot access restricted career records.
- [ ] Rate limits, request limits, template escaping, and required authentication checks work.
- [ ] Logs exclude submission bodies and secrets; retention and deletion behaviour is documented and verified.
- [ ] Database recovery and notification-job recovery are tested.
- [ ] Desktop/mobile forms, product prefill, accessible error feedback, and successful submission are covered by automated tests.

Current frontend build/browser checks do not verify these future backend requirements.
