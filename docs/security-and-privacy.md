# Security, Data Minimization, and Risk Controls

> The local version keeps conditions and conversation in browser-tab state; shopping summaries are previewed and copied by the user. Public sharing and deployment policies are proposed, not accepted or verified.

The API validates origin, JSON format, request size, schema, model output, and per-process rate limits. Keys stay server-side. When OpenAI is enabled, the current message and necessary planning conditions are sent to the provider. Use synthetic cases and do not enter identifying data. Local rules detect only some obvious contact or identity-number formats; they are not comprehensive data-loss prevention.

## Risk controls

| Risk | P0 policy | Verification target |
|---|---|---|
| Medication or clinical diet question | No interaction or treatment judgment; refer to a professional. | CK-T22, T26, T27 |
| Explicit ingredient exclusion ignored | Server preserves hard constraints and rechecks output cards. | CK-T16, T21, T23 |
| Price/nutrition hallucination | Application recalculates using user-supplied unit prices; unknown remains unknown. | CK-T11–T15 |
| Conversation exposed unexpectedly | Private by default; future publication needs preview, consent, de-identification, read-only token, expiry, and revocation. | CK-T30 |
| Unauthorized session access | Do not allow arbitrary reads by URL session ID; isolate owner sessions/capabilities. | Manual access-control tests |
| API key exposure | Trusted server environment only; never client-side or in Git. | Secret scan and browser inspection |
| Prompt injection | User text cannot override system policy; server validates hard constraints and outputs. | CK-T28 |
| Demo abuse | Rate, request, token, and cost limits; errors must not reveal internals. | 429 and load cases |
| Misleading or unreadable responses | State price uncertainty and non-medical scope plainly; avoid authoritative tone. | Role and UX checks |

These are requirements and test targets, not claims that a security audit has passed.

## Personal data not needed

Do not request names, addresses, phone numbers, identity documents, birthdays, prescriptions, medication names, medical records, diagnoses, family histories, or health photos. Prefer synthetic cases. If users volunteer sensitive material, avoid echoing it into public logs or shares and do not retain it as a long-term profile.

## Sharing and external evaluation

- Before creating any future share, preview the full content and explain that anyone with the link may read it. Do not preselect consent.
- Create an anonymous read-only snapshot; a public URL must not enable editing or continuation of the original chat.
- Store only a hash of a high-entropy token; give the owner a separate revocation path and implement actual expiry/deletion.
- Pseudonyms do not guarantee that a conversation is unidentifiable. Automated redaction is not a safety guarantee.
- Before submission, test sharing, expiry, revocation, and not-found behavior in a private browser. Do not expose private administration data to evaluators.
- Retention proposals in [API/data contracts](api-and-data-contracts.md) are not a formal data policy until approved.

## Minimum checks before any deployment

Verify HTTPS; HttpOnly/Secure/SameSite cookies where applicable; CSRF/origin protection; request schema validation; response encoding; rate limits; model timeout and safe errors; log redaction; dependency risk; environment-variable access; and conversation backup/deletion policy. These checks have not been run as a deployment security scan.

## Participants and student privacy

Before interviewing older adults or caregivers, define consent, purpose, retention, and withdrawal. Avoid collecting unnecessary diagnosis or prescription data. Publish only anonymized, consented feedback. If target users are not available, state that user needs remain unvalidated.

## Claims the assistant must not make

Do not claim that a meal is guaranteed healthy for older adults, treats a condition, is safe with a named medication, has been reviewed by a clinician/dietitian, or is guaranteed to fit real prices. Server and content checks should reject such guarantees even if a prompt produces them.
