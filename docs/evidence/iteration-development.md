# WAICY Criterion 6: CareKitchen Iteration and Evaluation Record

**Recorded November 23, 2026.** CareKitchen ran a direct GPT-6 Luna dialogue baseline and product versions V1–V4. On the same 16-turn engineering suite, passing turns rose from 5/16 in V1 to 16/16 in V2; V3 and V4 retained 16/16. V3 addressed role routing. A separate five-turn V4 suite checked conversational constraints not covered by the original cases.

Raw JSON, prompts, case files, and screenshots preserve their original contents. The English narrative below is a translation and summary of that evidence; it does not replace or alter the historical source records.

## 1. Prompt and application revisions

| Version | Design at the time | Original prompt | Application snapshot |
|---|---|---|---|
| Baseline | General conversation history sent to the Responses API with the instruction “Reply to the user in Traditional Chinese.” | [Baseline](prompts/baseline.txt) | [Evaluation script](../../web/scripts/evaluate.ts) |
| V1 | Model classified and ranked candidates from the current message and scenario; broad decisions about whether to clarify were left to the model. | [V1](prompts/v1.txt) | [V1 adapter](prompts/adapter-v1.ts.txt) |
| V2 | Trusted server-parsed conditions; distinguished unknowns that do not block planning from required clarifications. Added structured `clarification` with a field and quoted user text, then server validation. | [V2](prompts/v2.txt) | [V2 adapter](prompts/adapter-v2.ts.txt) |
| V3 | Treated a stated shopping budget as part of meal planning; server recognized explicit shopping-summary intent and role-specific output. | [V3](prompts/v3.txt) | [V3 adapter](prompts/adapter-v3.ts.txt) |
| V4 | Emphasized exclusions and budget changes not yet applied. Server parsed common conversational edits and rechecked candidates against updated conditions. | [V4](prompts/v4.txt) | [V4 adapter](prompts/adapter-v4.ts.txt) |

Prompt SHA-256 hashes match the `promptSha256` fields in the run JSON; V1–V4 adapter snapshots match `adapterSha256`. V1 was reconstructed from Git base `612ef35` and the recorded Luna settings. V2 and V3 were reconstructed from known prompt differences and V4. Each `sourceHead` records the Git base; the four versions were run sequentially on that base, and complete working trees were not separately archived for each version. Treat these as reconstructed snapshots, not contemporaneous full checkouts.

## 2. Fixed evaluation and results

The [fixed suite](cases/meal-dialogues.json) has 16 turns and 56 expected checks: a shared prompt for three roles, a ten-turn elder conversation, and separate price/dietary boundary cases. Each application turn carried forward prior conditions and candidate IDs, applied the current update, and checked the response. A turn passed only when all expected checks passed. V4 also ran the [five-turn edge-case suite](cases/meal-edge-cases.json).

All runs used `gpt-6-luna`, `reasoning.effort: none`, and `store: false`. The direct baseline allowed 650 output tokens and used free text plus chat history. CareKitchen allowed 250 tokens and used structured input and decision fields; the server handled hard constraints, prices, and meal content. The baseline comparison is qualitative. V1–V4 measure the whole product flow, including both prompts and server logic.

| Run | Taiwan time, first to last turn start | Passing turns | Checks | Model turns | Raw result |
|---|---|---:|---:|---:|---|
| Direct baseline | 13:41:08–13:41:57 | 16 free-text responses | Qualitative review | 16 | [responses](runs/luna-direct-baseline.json) |
| V1 | 13:36:13–13:36:29 | 5/16 | 29/56 | 12 | [run](runs/luna-pre-fix.json) |
| V2 | 13:41:08–13:41:22 | 16/16 | 56/56 | 11 | [run](runs/luna-post-fix.json) |
| V3 | 13:44:49–13:45:03 | 16/16 | 56/56 | 11 | [run](runs/luna-v3.json) |
| V4 | 13:48:00–13:48:14 | 16/16 | 56/56 | 11 | [run](runs/luna-final.json) |
| V4 conversational edge cases | 13:48:00–13:48:06 | 5/5 | 12/12 | 5 | [run](runs/luna-safety-recheck.json) |

The six JSON files contain 85 turns: 66 involving Luna and 19 handled directly by code. All six `errors` arrays were empty. The baseline retains 16 model responses and usage. The 69 application turns retain input, checks, visible reply, and parsed model decision; upstream HTTP packets were not saved.

### Case-level observations

| Case | V1 | V2 | V3 | V4 |
|---|---|---|---|---|
| `SAME-ELDER-1` | Checks passed, but actual reply was routed as a shopping summary. | Same routing issue. | Meal suggestions. | Meal suggestions. |
| `SAME-CAREGIVER-1` | Too few candidates; asked again for known ingredients and servings. | Checks passed, but actual reply was a shopping summary. | Meal suggestions. | Meal suggestions. |
| `SAME-FAMILY-1` | Shopping summary. | Pass | Pass | Pass |
| `DEMO-10-1/2` | Turn 1 asked for missing equipment; turn 2 still returned no cards after equipment was supplied. | Both pass | Both pass | Both pass |
| `DEMO-10-3` through `DEMO-10-7` | Missed or misapplied exclusions, servings, budgets, supplied prices, or price uncertainty; too few candidates. | Pass | Pass | Pass |
| `DEMO-10-8/9` | Asked about an unconfirmed dietary restriction; referred medication question. | Both pass | Both pass | Both pass |
| `DEMO-10-10` | Servings, budget, equipment, exclusions, response type, and candidate count failed. | Pass | Pass | Pass |
| `COST-OVER-1` | Did not state that known shopping subtotal exceeded budget. | Pass | Pass | Pass |
| `ALLERGY-CONFIRMED-1` | Saved exclusion but returned too few candidates. | Pass | Pass | Pass |
| `ALLERGY-SYMPTOM-1` | Stored “follow-up” as an excluded ingredient and returned a generic question. | Referred; no candidates. | Same | Same |

Some routing/referral observations came from reviewing saved replies rather than the original scoring rubric: the initial shared-prompt checks did not require distinct role response types, and the symptom case did not initially specify `professional_referral`. The table preserves the original run scores.

## 3. Failures, fixes, and observed outcomes

| Failure observed | Cause and change | Evidence after change |
|---|---|---|
| A caregiver with complete conditions was asked to repeat known ingredients and servings. | V1 allowed broad model-led clarification. V2 moved required-field checks to the server and required a new, relevant missing condition with a matching user quote. | `SAME-CAREGIVER-1` and `DEMO-10-2` returned candidates in V2; V4 returned three and two candidates respectively. |
| Conversational edits were missed or parsed incorrectly: “no egg for now” became the ingredient “egg for now”; “make it two people, around NT$80” retained one person/NT$100; replaced equipment remained active. | Updated turn parsing and re-evaluation retained unchanged conditions while applying the new state. | V4 `DEMO-10-3/4/7` retained the egg exclusion, changed servings and budget, then updated equipment; the tenth-turn summary retained those conditions. |
| Known prices were re-requested or budget status was unclear. The direct baseline estimated NT$49 and said it was under NT$100 although listed line items (24, 40, 24) total NT$88; it prorated package costs by recipe quantity. | V2 accepted explicit item, package quantity, and total price. Server logic counted whole packages required for new shopping, kept missing prices unknown, and stopped when the known subtotal exceeded budget. | V4 `DEMO-10-5/6` retained tofu 300 g/NT$45 and rice 500 g/NT$60; unknown vegetable price kept total unconfirmed. `COST-OVER-1` reported known shopping of at least NT$120 against NT$100 and returned zero cards. |
| Explicit exclusions and possible symptoms were handled as the same kind of issue. | V2 handled symptoms, medication, and uncertain restrictions before candidate generation; confirmed exclusions filtered related ingredients, while possible reactions triggered referral. | `ALLERGY-CONFIRMED-1` returned three candidates without tofu. `ALLERGY-SYMPTOM-1` referred, returned zero cards, and did not store “follow-up” as an exclusion. The baseline also declined a safety guarantee but offered alternatives. |
| A passing score did not ensure role differentiation: V2 routed all three shared-prompt roles to shopping summaries. | V3 separated budget mentions from explicit shopping requests and added role-specific reasons and interface information. | In V3/V4, elder and caregiver cases returned meal suggestions (two and three); the family case returned a shopping summary (three). Caregivers saw servings/exclusions; relatives could preview pantry, purchase, and unknown-price items. |
| Original cases did not cover other phrasings such as “no egg,” “keep total under 70,” “no cooking today,” or changing from one to two people. | V4 updated exclusion, Chinese budget, no-cook, latest-serving, and depleted-inventory handling; local regression checks were added and the model edge suite was run. | Edge suite passed 5/5 turns and 12/12 checks. The inventory-exhaustion behavior also received a local rule check. |

The model and `none` reasoning setting were retained; the saved evidence does not include a backup model or higher reasoning setting comparison.

## 4. Browser observations and interface changes

An initial synthetic elder request (one serving, tofu 150 g, greens 120 g, NT$100, rice cooker) received HTTP 200 with `gpt-6-luna` and `carekitchen-v1` in 2,399 ms, but asked again for supplied conditions. This led to role trials and versioned evaluation.

| Stage | Recorded observation | Screenshot or record |
|---|---|---|
| V1 role trial, seven website requests | Elder default showed two meals and unknown mushroom price. After changing to two servings and no egg, state updated but the system asked again and showed no cards. Free-form input missed serving count and inventory until simplified. Caregiver with complete data was also asked again. Family free text misread inventory; preset flow showed three options and a preview/copy summary. | [elder follow-up](screenshots/v1-elder-follow-up-desktop.png), [caregiver mobile](screenshots/v1-caregiver-narrow-followup.png), [family summary](screenshots/v1-family-narrow-preview.png) |
| V1 independent check, six HTTP 200 calls | Found serving/budget/equipment update errors, unclear over-budget explanation, symptom stored as ingredient, extra questions after exclusions, and wrong candidate count. Clarification for unknown restrictions was retained. Five of six turns got a model decision. | [V1 fixed-suite record](runs/luna-pre-fix.json) covers several related failures. |
| V3 role retest, six website requests | Free-form input produced meals; later two-serving/no-egg change kept cards; replacing a meal used the new candidate ID. Family flow retained three pantry items and preview/copy summary. Caregiver got two egg-free meals; elder preset was also tried. | [elder two servings](screenshots/v3-elder-two-person-no-egg.png), [caregiver exclusion](screenshots/v3-caregiver-exclusion-narrow.png), [family meals](screenshots/v3-family-three-meal-preview.png) |
| V4 browser, 390 × 844 | Two API turns confirmed two servings, NT$80, egg exclusion, and matching cards. The evidence page showed ten turns and seven model-participation markers without horizontal overflow at the tested width. | [Playwright script](browser/final-v4-check.js), [mobile evidence page](screenshots/v4-waicy-evidence-mobile.png) |

Two independent agents acted as users and reviewers. Some exploratory requests survive only in contemporaneous notes, not per-request raw HTTP records; these observations and model-stub checks are not part of the 85 formal run records. The UI added a current-turn change notice, role-specific meal reasons, relevant preset scenarios, and explicit unknown-cost and serving details. Multi-meal candidates represent one meal scaled to multiple servings, with batch time labeled as an estimate. The V4 transcript came from that run's `DEMO-10`; the published local page now uses the English exchange in section 7. See [user flows](../ux-and-user-flows.md).

## 5. Hash checks and rerun instructions

From the repository root, compare prompt hashes with `shasum -a 256 docs/evidence/prompts/*.txt`. The following commands call the authorized OpenAI API and write new files; do not overwrite archived runs:

```sh
cd web
node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts app retest ../docs/evidence/runs/retest.json
node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts app retest-edge ../docs/evidence/runs/retest-edge.json ../docs/evidence/cases/meal-edge-cases.json
node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts baseline retest-baseline ../docs/evidence/runs/retest-baseline.json
```

Earlier local verification ran `pnpm lint`, `pnpm typecheck`, `pnpm test` (34 tests), and `pnpm build`. Every version was run once on synthetic cases. Passing counts are engineering checks on these cases, not a general accuracy, nutrition-quality, or safety rate. Target-user research, verified student contribution, a publicly usable judge URL, and formal submission remain outstanding.

## 6. New challenge and regression before submission

Seven new scenarios, ten turns, and 41 expected checks were fixed in [the challenge case file](cases/waicy-final-challenge.json) and first run at Git base `f39fbdf` using the existing GPT-6 Luna settings, before these inputs were used to adjust the implementation. They cover three roles, simultaneous equipment/exclusion changes, package quotes, pantry-only requests, and unknown conditions.

| Run | Passing turns | Checks | Execution errors |
|---|---:|---:|---:|
| [New challenge before fixes](runs/luna-waicy-challenge-before.json) | 7/10 | 36/39 executed; two not rated because that turn had no reply | 1 |
| [Same challenge after fixes](runs/luna-waicy-challenge-after.json) | 10/10 | 41/41 | 0 |
| [First regression rerun of established suite](runs/luna-waicy-final-dialogues.json) | 15/16 | 50/50 executed; six not rated | 1 |
| [Complete repeat of established suite](runs/luna-waicy-final-recheck.json) | 16/16 | 56/56 | 0 |

| Case | Before-fix observation | Fix and rerun |
|---|---|---|
| Caregiver changes equipment | “Keep the unusable ingredients the same” was parsed as “the ingredients the same”; zero candidates. | Changed only equipment to rice cooker, retained two servings and two exclusions, and returned three rice-cooker meals. |
| Relative updates prices and lowers budget | “Lower shopping budget to NT$25” retained NT$100 and asked the user to re-enter the budget. | Tofu NT$36/package plus greens NT$28/package totaled NT$64; rice was NT$85/package. At NT$25, the minimum required purchase was NT$42, so the app stated the overrun and stopped recommending. |
| Elder/family meal with unclear servings | “My child and I will eat; the child only eats a little” logged `Error`; the cause was unknown. A model-stub clarification quoting the original input exposed possible retention of one serving. | When the group changes but servings are not supplied, servings are cleared as unconfirmed; the app asks before showing candidates. |
| Unclear dietary restriction | A clarification was saved as an exclusion (“the elder has some vegetables…”). | Keeps the condition unconfirmed and preserves existing exclusions instead of writing an uncertain phrase into the confirmed list. |
| Frequent choking while eating | The model referred appropriately in this run. | The server now refers on the same wording; regression checks confirm no candidates and no model decision is required. |

The first established-suite regression logged only `Error` for `DEMO-10-10`. Two isolated retries with identical input and state returned HTTP 200 with complete decisions, then the original suite completed on rerun. Both full regression records are retained; the ten-turn display is taken from the successful repeat. The exact cause of the initial error is unknown. Prompt and model settings stayed at V4; this pass focused mainly on condition parsing and presentation.

A local code check found that “keep the ingredients I cannot eat, but no egg today” was skipped in its entirety by an earlier patch. Parsing was adjusted to separate carry-forward language from the new restriction. Three phrasings confirmed existing exclusions were kept, egg was added, and candidates contained no egg; this was a local rule check.

Local lint, type checking, 39 tests, and production build passed. Offline replay of 26 saved model decisions confirmed that the last parsing patch did not change those saved replies. The ten-turn display data was also compared with the full rerun source. Chromium layout was checked at 320, 390, and 900 CSS px. At 390 px, the English judge guide opened the meal flow and obtained two live Luna replies. The second turn simulated HTTP 503, then retried against the real API; the conversation retained one user message and showed “shopping total pending confirmation.” See [browser script](browser/waicy-readiness-check.js), [judge-guide screenshot](screenshots/waicy-final-judge-guide.png), and [price screenshot](screenshots/waicy-final-mobile-cost.png).

## 7. Current English-language evidence

The earlier V1–V4 measurements above used Traditional Chinese inputs and prompts. They are historical results and should not be presented as English-language evaluation. For this work round, an English fixture and prompts were frozen and run against the same base commit, `39ab10d`:

| Run | Fixture and prompts | Result | Raw record |
|---|---|---|---|
| English direct baseline | [English fixture](cases/waicy-english.json), [baseline prompt](prompts/english-baseline.txt) | 16/16 free-text replies completed; no scored assertions | [English baseline run](runs/luna-english-baseline.json) |
| English CareKitchen V5 | Same English fixture, [V5 prompt](prompts/english-v5.txt) | 16/16 turns, 59/59 checks; 11 model-backed turns; zero execution errors | [English V5 run](runs/luna-english-v5.json) |

The V5 record also supplies the actual English `EN-DEMO-1` through `EN-DEMO-10` transcript: 20 messages across ten exchanges, seven model-backed and three handled locally. This is synthetic conversation evidence, not a conversation with a real target user or an externally hosted reviewer session.

For `EN-COST-OVER-1`, the English direct baseline prorated package costs and suggested reducing the total to TWD 96.40. V5 calculated a minimum whole-package purchase of TWD 120 against the TWD 100 budget, stated the known overrun, and returned no meals. This is one recorded case, not evidence of general superiority.

Both runs use model `gpt-6-luna` and record prompt hashes in the JSON. The `sourceHead: 39ab10d` field identifies the Git base of the worktree used for these runs. The English comparison is not directly interchangeable with the older Chinese V1–V4 series: its language, fixture, and baseline prompt are distinct. Refer to each run's archived raw response and checks for exact outputs.

### English browser verification

The [browser check](browser/waicy-english-check.js) reached the actual OpenAI-backed preview in all three roles. The [browser record](runs/browser-english-v5.json) logs five live model turns and one server-only medication referral, all with HTTP 200. The [screenshots and PDF](waicy-pdf-materials/README.md) were captured after the reply and available cards appeared. At 320 CSS pixels the English reading controls initially caused horizontal overflow. The header now wraps the controls, and the workspace and evidence page fit the tested 320, 390, 900 and 1440 CSS-pixel widths.
