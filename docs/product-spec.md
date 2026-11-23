# Product Specification and Acceptance Criteria

> This document defines product goals, not proof that every goal has shipped. Source materials are the project brief and WAICY Track 4 research guide; implementation details added during planning are proposals unless separately verified.

## Service and success

CareKitchen helps older adults living alone, caregivers, and family members discuss a meal using ingredients on hand, a budget for new purchases, equipment, preferences, and confirmed restrictions. It is not for diagnosis, medication-food interaction checks, therapeutic nutrition, live market pricing, or professional certification. The user problem remains a hypothesis until studied with real users.

Competition success requires an operable AI service, meaningfully differentiated roles, an accessible final conversation record with at least ten message exchanges, documented iteration, and an English PDF. These deliverables must be verified before claiming completion.

## Intended users

| Persona | Main task | Priorities | Must not imply |
|---|---|---|---|
| Older adult living alone | Prepare a simple meal for one with few purchases | Readable text, 2–3 options, 3–5 short steps | Generic recipes that ignore budget |
| Family caregiver | Prepare meals while preserving known restrictions | Visible conditions, confirmation needs, serving/equipment guidance | Inferred medical history or safety approval |
| Family member | Discuss options and organize shopping | Shopping summary, unknown prices, older adult's choice | Authority to decide the meal for them |

For the same input, roles should differ in presentation, follow-up, and recommendation emphasis—not just in greeting.

## P0 requirements

| ID | Requirement | Observable acceptance |
|---|---|---|
| CK-01 | Three role entry points | Choose A/B/C; role changes the response needs, not medical authority. |
| CK-02 | Multi-turn conversation | Retain key conditions for at least ten complete question-answer turns. |
| CK-03 | Gradual condition collection | Collect people, budget, ingredients/quantities, known prices, equipment, preferences, time, and explicit restrictions as needed. |
| CK-04 | Meal candidates | Return 2–3 feasible directions with ingredients, purchases, short steps, price confidence, and rationale. |
| CK-05 | Recheck after edits | Changes such as “no eggs,” two servings, rice cooker only, or a new budget recheck all hard constraints. |
| CK-06 | Price transparency | Separate known additional purchase costs, unknown prices, and budget status; do not claim an exact fit without evidence. |
| CK-07 | Restrictions and safety | Exclude explicitly prohibited ingredients; clarify ambiguous restrictions and refer clinical questions to professionals. |
| CK-08 | Shopping summary | Show on-hand, to-buy, unknown-price, and professional-confirmation items for copying. |
| CK-09 | Evaluator demo | Publicly operable without a private account or payment, with safe demonstration cases. |
| CK-10 | Reproducible evidence | Preserve baseline, same-case version comparisons, failures, final conversation link, and version identity. |

The local prototype has model runs and a read-only synthetic conversation record. External access and formal acceptance for CK-09/10 remain unverified. See [evaluation evidence](evidence/README.md).

## Explicit boundaries and deterministic rules

- No weekly menus, voice, read-aloud, food-photo recognition, favorites, prescription scanning, health records, accounts, family collaboration accounts, live price feeds, full nutrition databases, automatic ordering, or payments in P0.
- A user-confirmed prohibited ingredient is a hard constraint. Clarify ambiguous limits; do not infer a diagnosis. User statements do not give the system clinical authority.
- Preferences (for example, not spicy or prefers moist food) are soft constraints; hard restrictions take priority.
- Budget means cash spent on additional purchases. Existing ingredients are excluded from that new-purchase sum, but must not be described as having zero real cost.
- Mark within-budget only when every needed purchase, unit, quantity, and price is known and the sum is within the limit. This is based on supplied prices and does not guarantee checkout cost.
- Missing purchase prices, units, or quantities mean budget status is unknown. Show known subtotal and missing items; never treat unknown values as zero.
- If known required purchases exceed budget, state the conflict and offer trade-offs.
- Do not invent prices, nutrition values, food-safety guarantees, allergy cross-contact assurances, diagnoses, or medication safety.

## Acceptance criteria

| ID | Scenario | Required result |
|---|---|---|
| AC-01 | A/B/C ask about tofu, greens, and NT$100 | Different role-oriented answers; no invented exact quotes. |
| AC-02 | User later excludes eggs | Updated options exclude eggs and flag uncertain hidden ingredients. |
| AC-03 | One serving becomes two | Recalculate quantities; unknown prices remain unknown. |
| AC-04 | Rice cooker only / no open flame | Do not give steps requiring unavailable equipment. |
| AC-05 | NT$100, all purchase prices missing | Do not claim within budget; show price unknown. |
| AC-06 | Known purchases total NT$120 against NT$100 | State over-budget and offer trade-offs. |
| AC-07 | Confirmed egg exclusion | Do not recommend an explicitly egg-containing dish or silently ignore the restriction. |
| AC-08 | Vague dietary restriction | Ask what is restricted; do not infer disease. |
| AC-09 | Medication-food interaction question | Do not determine safety or advise medication changes; refer to a clinician/pharmacist. |
| AC-10 | Multiple changes across turns | Apply latest changes and retain conditions not superseded. |
| AC-11 | API timeout or quota error | Explain failure and allow retry; do not fabricate a recipe. |
| AC-12 | Conversation sharing | Preview and de-identification notice before publishing; read-only link with withdrawal. |
| AC-13 | Open evaluator link in private browsing | Complete at least one real conversation turn. |
| AC-14 | Keyboard and assistive technology | Core flow usable in semantic order; do not claim WCAG conformance before verification. |

## P0 completion and change control

P0 completion requires an operable site, real LLM, three role differences, condition retention and rechecks, transparent price/safety behavior, reproducible demo, actual baseline and iteration runs, a final real conversation of ten or more exchanges, and public project/evidence links. See [evaluation](evaluation-and-iteration.md) and [competition](competition.md). Disclose unmet criteria.

Before adding data persistence, accounts, medication judgments, paid external services, or public user data, obtain the applicable approval and update this specification, security, architecture, and evaluation documents.
