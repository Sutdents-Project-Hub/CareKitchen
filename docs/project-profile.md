# Project Profile

## Identity

- Project: CareKitchen | AI Meal Planning for Older Adults
- Repository: `CareKitchen`; project slug: `carekitchen`
- Stage: `competition`; product: `web`; bootstrap: `scaffold`
- Deployment: planned; platform not confirmed
- Team collaboration: enabled; no structure exception

## Summary

Conversational meal planning for older adults, caregivers, and family members. The service uses ingredients, prices and budget supplied by the user, preferences, equipment, and restrictions the user has confirmed. It does not make medical, medication, or clinical food-safety judgments.

## Component

| Component | Path | Framework | Package manager | Quality checks |
|---|---|---|---|---|
| Web | `web/` | Next.js | pnpm | lint, typecheck, test, build |

The implemented stack is Next.js 16, TypeScript, Node.js 24 LTS, and pnpm 10. Server Route Handlers handle AI requests and safety checks. No app, CMS, worker, or separate backend is planned for the current scope.

## Confirmed product scope

- Three differentiated roles: older adult living alone, family caregiver, and family member.
- Gradual collection of party size, budget, ingredients, prices, equipment, preferences, time, and confirmed restrictions.
- Context-aware meal planning with up to three candidates, steps, and a shopping summary.
- Recheck hard constraints after changes to ingredients, preferences, party size, or time.
- State unknown or conflicting prices and restrictions transparently; do not silently drop an explicit restriction when replacing a meal.
- Preserve synthetic-case evidence and distinguish it from real-user research.

## Boundaries and delivery status

- English is the default interface language; Traditional Chinese remains supported. An English API request may pass optional `language: "en"`; callers omitting it retain the previous Chinese behavior.
- Budget means additional purchase spending based on user-provided package prices. Missing prices or quantities must not be treated as zero or used to claim the budget is met.
- Do not collect older adults' names, medical records, prescriptions, student identity, address, photos, or other unnecessary personal data. Prefer fictional cases.
- Keep provider keys server-side. Do not add paid services, external resources, deployment, or data collection without authorization.
- No clinical or pharmacist endorsement, diagnosis, medication interaction, medication adjustment, therapeutic diet, or safety guarantee.
- English competition documents are planned. The stated target of 2026-11-29 is not a verified official deadline; recheck official notices before submission.

## Assumptions and unresolved decisions

OpenAI Responses API is implemented with `gpt-6-luna` as the default model and `reasoning.effort: "none"` for Luna. Local synthetic runs are recorded; public quotas, cost controls, hosting, URL, persistence, deletion and sharing consent, real-user usability, eligibility, submission status, and license remain unconfirmed. See [project overview](project-overview.md), [deployment plan](deployment.md), and [source register](source-register.md).
