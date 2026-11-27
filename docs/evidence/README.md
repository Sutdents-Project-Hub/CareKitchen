# CareKitchen Evaluation Evidence

**Evidence status as of November 23, 2026.** The archived Chinese V1–V4 runs and the current English V5/baseline runs used authorized OpenAI API calls with synthetic meal-planning scenarios. Browser roles were acted by agents. No target-user interviews, external judge testing, or formal submission is evidenced here.

**Added November 27, 2026:** the [final chat history](waicy-chat-history.md) (ten rounds, synthetic) and a [hosted-app check](runs/live-deploy-2026-11-27.json) of 23 invented requests, all HTTP 200.

The [iteration and development record](iteration-development.md) documents the historical Chinese direct baseline and V1–V4, and the current English direct baseline and V5. Raw run JSON and original prompt/case files remain the source records; English narrative summaries do not replace them.

The historical Chinese new-case challenge improved from 7/10 to 10/10 after fixes; a later complete rerun of its established 16-turn suite passed 16/16. See [historical challenge and regression evidence](iteration-development.md#6-new-challenge-and-regression-before-submission). English V5 passed 16/16 synthetic turns and 59/59 checks (11 model-backed, zero execution errors); its direct English baseline completed 16 free-text replies with no scored assertions. See [English-language evidence](iteration-development.md#7-current-english-language-evidence). The [screenshot appendix](waicy-pdf-materials/README.md) shows actual English turns, server-side referrals and the archived English transcript.

## Repeated fixed-suite results

The [16-turn suite](cases/meal-dialogues.json) covers a shared prompt for three roles, a ten-turn elder dialogue, budget overrun, explicit allergen exclusion, and symptom escalation. A turn passes only when every expected check for that turn passes.

| Version | Passing turns | Checks | Turns involving model | Raw record |
|---|---:|---:|---:|---|
| V1 | 5/16 | 29/56 | 12 | [pre-fix](runs/luna-pre-fix.json) |
| V2 | 16/16 | 56/56 | 11 | [clarification, natural-language conditions, and budget fixes](runs/luna-post-fix.json) |
| V3 | 16/16 | 56/56 | 11 | [role-routing revision](runs/luna-v3.json) |
| V4 | 16/16 | 56/56 | 11 | [same-suite rerun](runs/luna-final.json) |

V4 also passed five [conversational edge cases](cases/meal-edge-cases.json), including “no eggs,” a lower budget, no-cook equipment, and changing to two servings. Model participation counts come from each turn's `modelInfo`. These results describe only the fixed engineering cases. [Edge-case run](runs/luna-safety-recheck.json)

## Direct Luna baseline and representative cases

The [direct Luna baseline](runs/luna-direct-baseline.json) used the same model and case text with the scenario already filled in. It used ordinary chat history and a minimal Traditional Chinese instruction; CareKitchen used role context, structured conditions, and cost rules. This is a qualitative case comparison, not a controlled general benchmark.

- **COST-OVER-1:** The direct model apportioned package prices by recipe quantity and estimated about NT$49, saying the meal was within the NT$100 budget. CareKitchen counted whole-package shopping outlay; known required purchases were at least NT$120, so it stopped presenting candidates and explained that the known subtotal exceeded the budget.
- **DEMO-10-3/4:** V1 parsed “no egg for now” as the ingredient “egg for now” and later retained one serving and NT$100. V4 retained the equipment, updated to two servings and NT$80, and excluded egg.
- **SAME-ELDER / CAREGIVER / FAMILY:** V4 gave role-specific reasons for the same request. The elder saw two simple choices and pantry use; the caregiver saw servings and condition checks; the relative saw shopping items, missing prices, and a previewable summary.
- **ALLERGY-SYMPTOM-1:** The direct model also declined to guarantee egg safety. V4 used a server-side referral and returned no candidates, preventing “follow-up” from being stored as an ingredient.

## Ten-turn recorded dialogue

The read-only local `/evidence/waicy` page is drawn from `EN-DEMO` in the [English V5 run](runs/luna-english-v5.json). It contains ten English exchanges (20 messages): seven turns with a Luna decision and three handled by program rules for missing equipment, an unconfirmed dietary restriction, and a medication question. The [earlier Traditional Chinese rerun](runs/luna-waicy-final-recheck.json) remains archived. Both public submission links still require external verification.

## Re-running

From `web/`, these commands make real API calls and write new files; do not overwrite the archived records:

```sh
node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts app retest-en ../docs/evidence/runs/retest-en.json ../docs/evidence/cases/waicy-english.json
node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts baseline retest-baseline-en ../docs/evidence/runs/retest-baseline-en.json ../docs/evidence/cases/waicy-english.json
```

Records include timestamps, model, prompt hash, input, visible application reply, and model decision. `sourceHead` identifies the Git base for that development run; model settings and prompt hashes help identify the configuration. Student contribution, target-user validation, formal scoring, and public reviewer acceptance require separate evidence.
