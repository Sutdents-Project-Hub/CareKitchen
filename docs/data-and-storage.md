# Data Sources, Retention, and Deletion Plan

> Current behavior: conversation and conditions exist only in the current browser tab and clear on reload. The server does not store conversations. Users may preview and copy shopping text. No database, schema, migration, or real-user dataset has been created. This document describes proposed future work only; see the [API and data contract](api-and-data-contracts.md).

## Data minimization

- Meal planning needs only role, ingredients and quantities, budget, known prices, equipment, preferences, and ingredient exclusions.
- Do not collect older adults' names, medical records, prescriptions, identity data, photos, or contact information. A dietary restriction is not a verified medical record.
- Prefer synthetic test cases. Interviews or real-user trials require consent and de-identification.
- Label user-provided prices as `user-supplied` and retain their units. Any future external price source needs its own source and update time.

## Data classes

| Data | Proposed handling | Public? |
|---|---|---|
| Live `MealContext` | Needed for the current chat; retention policy not approved. | Private by default. |
| Conversation messages | Minimize retention; policy not approved. | Private by default. |
| Consented final conversation snapshot | Available only during evaluator review, then expired/revoked. | Only after de-identification and explicit approval. |
| Synthetic cases and model outputs | Support baseline/version replay and reporting. | Only if the case is synthetic and safe to publish. |
| API/database credentials | Not application data; never write to files or logs. | Never. |
| Real medical records/prescriptions/student personal data | Do not collect for P0. | Never. |

## Storage proposal (not approved or implemented)

A persistent database may be needed for sessions across serverless instances and share snapshots. PostgreSQL is a candidate baseline, but provider, ORM, and cost are undecided. Do not treat Next.js process memory as durable storage. If an external document-sharing service is considered instead, evidence must still come from the actual final AI conversation and remain readable.

Keep synthetic and private materials separate under `docs/evidence/`. Do not commit sensitive raw conversations.

## Retention and deletion decisions required

- A 24-hour private-session and 14-day shared-snapshot lifetime were proposed for discussion only; no retention policy has been approved.
- A user should be able to revoke a public share. Deletion review must include caches, backups, and CDN copies.
- If a database is approved, define migrations, tested backup/restore, least-privilege access, preview/production separation, deletion jobs, and rollback.
- Do not create a production database, real secrets, or retention job without the required explicit authorization.

## Verification status

Ten-turn condition retention has been checked with fixed synthetic cases. Visitor isolation, public snapshot preview, withdrawal, expiry, deletion, and production failure behavior are unverified. The local [`/evidence/waicy` record](evidence/README.md) is compiled from the synthetic `DEMO-10` run; interactive state remains in the current tab and shopping summaries are copied by the user.
