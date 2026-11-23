# CareKitchen: A Conversational Meal-Planning Assistant

**WAICY 2026 · LLM & AI Agent (AI as a Service) · High School**

- **Student or team** · [ADD VERIFIED STUDENT NAMES AND SCHOOL]
- **Live assistant** · [ADD PUBLIC URL TESTED IN A PRIVATE BROWSER WINDOW]
- **Final conversation transcript** · [ADD PUBLIC READABLE URL]

## Project summary

CareKitchen is a conversational meal-planning assistant for older adults living alone, family caregivers, and relatives who help coordinate meals. A user can provide ingredients on hand, quantities, a spending limit, cooking equipment, preferences, and confirmed ingredient restrictions. The service carries those conditions through follow-up messages, checks recipe candidates against them, and presents simple steps and a shopping summary. Unknown prices remain unknown; the tool does not claim clinical or allergy safety.

The current prototype uses the OpenAI Responses API when configured, with server-side checks for meal candidates, ingredient restrictions, and user-provided package prices. A clearly labeled local rules mode is available when no API key is configured. Local synthetic-case evidence is real model output, but it is not evidence of public availability, clinical validity, or success with real users.

## Who it serves and what it does

| Persona | Need | What the service emphasizes |
|---|---|---|
| Older adult living alone | A manageable meal using available food and equipment, often for one person | Readable choices, a few meal candidates, and short cooking steps |
| Family caregiver | Prepare food while retaining explicitly confirmed restrictions | Visible conditions, servings, exclusions, and items that still need checking |
| Relative | Coordinate choices and shopping with the older adult | “Already have,” “need to buy,” and “price unknown” details that can be previewed and copied |

These are product personas, not research participants. In the English V5 fixed test, all three received the same original English prompt about cooking for one with 150 g of tofu, 120 g of leafy greens, a rice cooker, and a NT$100 budget. The elder flow returned two candidates; the caregiver flow returned three and explicitly said to recheck servings, equipment, exclusions, quantities, and package ingredients; the family flow returned three and offered a previewable, copyable summary separating pantry items from purchases. This is a verified difference in presentation and workflow for the tested input, not evidence that real people prefer these differences. See `SAME-ELDER-1`, `SAME-CAREGIVER-1`, and `SAME-FAMILY-1` in the [English V5 run](evidence/runs/luna-english-v5.json).

## Motivation and problem statement

Choosing a meal can require coordinating what is already at home, what must be purchased, the available cooking equipment, the number of servings, personal preferences, and restrictions. CareKitchen is designed to keep those details together in a conversation instead of making a user repeatedly translate them into a generic recipe request.

Taiwan's Ministry of the Interior reported that people aged 65 and over made up 20.06% of the registered population at the end of December 2025. At the end of June 2025, 25.8% of registered people aged 65+ were in one-person households; household registration does not establish observed isolation or lack of support. These are demographic context, not evidence of a meal-planning problem. The specific meal-planning difficulty remains a design hypothesis. Interviews and task-based usability studies with the target audience remain pending. [December 2025 population statistics](https://www.moi.gov.tw/News_Content.aspx?n=2&s=335870) · [June 2025 one-person household statistics](https://www.moi.gov.tw/News_Content.aspx?Create=1&n=9&s=334815&sms=9009)

## Iterative development and evidence

The historical evaluation below compares a direct GPT-6 Luna conversation baseline with CareKitchen V1–V4 on the same 16 synthetic Traditional Chinese dialogue turns. A separate English-language evaluation is reported below; the historical Chinese results must not be read as English performance.

| Version | Passing turns | Passing checks | What changed |
|---|---:|---:|---|
| V1 | 5/16 | 29/56 | Initial model-led classification and clarification behavior |
| V2 | 16/16 | 56/56 | Server checks required missing information before blocking planning; structured clarification was validated |
| V3 | 16/16 | 56/56 | Budget mentions were distinguished from shopping-summary requests; role-specific response details were added |
| V4 | 16/16 | 56/56 | Common conversational edits were parsed and rechecked against updated conditions |

V4 also passed a separate five-turn conversational-boundary run (5/5 turns, 12/12 checks). These are engineering checks against a small, synthetic case set, not a general accuracy rate. Each version was run once. GPT-6 Luna used `reasoning.effort: none`; the run records retain inputs, model decisions, visible application replies, and checks. The app runs did not retain upstream HTTP packets.

The iteration addressed concrete failures:

- V1 sometimes asked users to repeat known ingredients or servings, or returned too few meal candidates. V2 moved required-condition checks to the server and constrained clarification to a new, relevant missing condition.
- Phrases such as “no egg,” “make it two servings,” and a revised budget could be missed or misparsed. V4 tests verified updated servings, budget, exclusions, and equipment across the covered examples.
- A direct baseline response estimated NT$49 and said the meal stayed under a NT$100 budget, while the listed amounts—NT$24, NT$40, and NT$24—sum to NT$88. It also apportioned costs by used quantity. CareKitchen instead calculates new shopping outlay from supplied package quantities and prices, and marks missing prices as unknown. In a separate V4 case, known necessary purchases totaled NT$120 against a NT$100 budget, so the app reported the known subtotal exceeded the budget and returned no candidates.
- V2 reached 16/16 but did not make the three role flows meaningfully distinct for the shared prompt: each could be routed to a shopping summary. V3 changed role-specific routing and response details. The English V5 same-input run also shows these role differences.
- A confirmed ingredient restriction and a possible symptom were initially handled too similarly. The revised flow filters an explicit exclusion and refers possible reactions or medication-food questions to a qualified professional instead of making a safety determination.

The direct baseline and V1–V4 results compare different systems. The baseline was free-text chat with a 650-token output limit; the application used structured inputs and decision fields, server-side recipe and cost checks, and a 250-token model output limit. The NT$49 arithmetic inconsistency is an observed baseline failure, while the later cost result is an observed application result. These findings support the value of the whole application workflow on the tested cases; they do not isolate a prompt-only effect or prove CareKitchen is generally better than a direct GPT conversation.

The [iteration record](evidence/iteration-development.md) links prompts, fixed cases, run files, and browser evidence. The six historical files contain 85 recorded turns, 66 with a saved Luna decision or response. The project then ran ten new synthetic turns, frozen before the final changes.

| Evaluation | Before the final changes | After the final changes |
|---|---|---|
| Ten new turns across all three personas | 7/10 passed, one execution error | 10/10 passed, 41/41 checks |
| Original 16-turn suite | V4 passed 16/16 | First rerun passed 15/16 with one execution error. The complete repeat passed 16/16 and 56/56 checks. |

In the new caregiver case, “keep the ingredients I cannot use the same” created a spurious exclusion and removed all meal options. The corrected flow changed the equipment from microwave to rice cooker and retained two servings and both existing exclusions. In the family case, lowering the budget to NT$25 used to leave the old NT$100 budget. The corrected flow applied the limit and reported that the least expensive verified purchase subtotal was NT$42. When a group changed and the new portions were unclear, the final flow asked for servings before offering options. The model and Prompt stayed the same in this pass.

The [new inputs](evidence/cases/waicy-final-challenge.json), [before run](evidence/runs/luna-waicy-challenge-before.json), [after run](evidence/runs/luna-waicy-challenge-after.json), [first regression rerun](evidence/runs/luna-waicy-final-dialogues.json), and [complete repeat](evidence/runs/luna-waicy-final-recheck.json) are all available. That repeat preserves 20 messages across ten historical Traditional Chinese exchanges. The current judge transcript comes from the English run below.

### Current English-language run

For this work round, an English direct baseline and CareKitchen V5 were run against the same [English synthetic fixture](evidence/cases/waicy-english.json), using distinct archived [English baseline](evidence/prompts/english-baseline.txt) and [V5](evidence/prompts/english-v5.txt) prompts. Both runs used GPT-6 Luna and were based on commit `39ab10d`.

| English evaluation | Result | Evidence |
|---|---|---|
| Direct baseline | 16 free-text responses completed; no assertion scoring | [raw baseline run](evidence/runs/luna-english-baseline.json) |
| CareKitchen V5 | 16/16 turns, 59/59 checks; 11 model-backed turns; zero execution errors | [raw V5 run](evidence/runs/luna-english-v5.json) |

The V5 record contains the English `EN-DEMO-1` to `EN-DEMO-10` transcript: ten synthetic exchanges (20 messages), seven model-backed and three handled locally. In `EN-COST-OVER-1`, the direct baseline prorated package prices and suggested reducing spending to TWD 96.40. V5 calculated a minimum whole-package purchase of TWD 120 against the TWD 100 limit, stated the known overrun, and returned no meals. This is a single case, not a general comparison result. The English run is separate from historical Chinese V1–V4 and does not establish real-user or clinical outcomes.

## Limits, ethics, and privacy

- CareKitchen is not a medical, nutrition-treatment, medication-interaction, or allergy-clearance tool. It does not diagnose, prescribe, adjust medication, or guarantee food safety. Users should confirm clinical, medication, swallowing, or uncertain restriction questions with a qualified professional.
- Prices come from the user. A missing price or quantity is not treated as zero, and a displayed calculation is not a guarantee of checkout cost. Existing pantry food is excluded from new shopping outlay; this does not mean that food has no cost.
- The current evidence uses synthetic meal scenarios. No older-adult or caregiver interviews, clinical review, or real-user validation have been completed. Passing checks do not measure nutritional quality or safety.
- The project is designed to avoid collecting names, medical records, prescriptions, addresses, photographs, or other unnecessary personal information. The prototype's public sharing, retention, and deployment policies still require review before release.
- A real reviewer-facing chatbot and shareable final conversation are not yet evidenced by this local report. Do not publish personal or health information in a transcript.

## Next validation steps

1. Complete a small, consent-based usability study with older adults, caregivers, and relatives using synthetic scenarios. Record task completion, misunderstandings, and usability feedback; do not present it as clinical validation.
2. Have a qualified reviewer examine the wording and escalation behavior for medication, allergy, swallowing, and uncertain-restriction cases. Record what was reviewed and what remains outside scope.
3. Use previously unseen prompts for the next evaluation and repeat them across different sessions. Track stale constraints, unnecessary clarifications, budget errors, and provider errors separately.
4. Before submission, verify the public assistant and final conversation from a logged-out browser, confirm that sharing and retention are understood, and fill in the verified links below. Update this report with the actual student contribution record.

## Conclusion and contribution record

CareKitchen progressed from 5/16 passing turns in V1 to 16/16 in V2, V3, and V4. The final fixes brought a later ten-turn challenge from 7/10 to 10/10. In the tested cases, the system kept known conditions across turns, applied new constraints, and explained when a shopping total was still unknown. The next validation step is to measure whether target users can make these changes and interpret the results without assistance.

**Student contribution (complete with the student's own verified account):** [Describe who personally defined the problem, designed cases and evaluation, made product decisions, implemented or reviewed code, tested the system, and prepared this report. Identify AI tools, mentor assistance, and other contributors accurately. Do not claim work that the student did not perform.]

## References and evidence

1. World Artificial Intelligence Competition for Youth. (2026). [WAICY 2026](https://www.waicy.org/waicy-2026/).
2. World Artificial Intelligence Competition for Youth. (2026). [WAICY 2026 rubrics](https://www.waicy.org/rubrics/).
3. World Artificial Intelligence Competition for Youth. (2026). [WAICY 2026 guidebook](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf).
4. CareKitchen, [product specification](product-spec.md), [competition checklist](competition.md), and [source register](source-register.md).
5. CareKitchen, [iteration and evaluation record](evidence/iteration-development.md), including historical [V1](evidence/runs/luna-pre-fix.json), [V2](evidence/runs/luna-post-fix.json), [V3](evidence/runs/luna-v3.json), [V4](evidence/runs/luna-final.json), and [direct baseline](evidence/runs/luna-direct-baseline.json), plus current [English baseline](evidence/runs/luna-english-baseline.json) and [English V5](evidence/runs/luna-english-v5.json).
6. Ministry of the Interior, Taiwan. (2026). [December 2025 household registration statistics](https://www.moi.gov.tw/News_Content.aspx?n=2&s=335870).
7. Ministry of the Interior, Taiwan. (2025). [June 2025 household registration statistics](https://www.moi.gov.tw/News_Content.aspx?Create=1&n=9&s=334815&sms=9009).
8. World Health Organization. (2025, October 1). [Ageing and health](https://www.who.int/news-room/fact-sheets/detail/ageing-and-health).

## Project description for the submission form

CareKitchen helps older adults living alone, family caregivers, and relatives plan a meal through conversation. The assistant remembers ingredients on hand, equipment, servings, a shopping budget, and confirmed exclusions. When the user changes a condition, it checks the meal choices again and shows what changed. Shopping costs use actual package sizes and prices supplied by the user. A missing price stays visible, and a relative can preview and copy a shopping summary. The project uses GPT-6 Luna for interpreting requests and ranking eligible recipes, with server-side checks for portions, equipment, exclusions, and cost. Real API tests on synthetic cases documented failures, fixes, and repeat runs. A ten-exchange example shows how the service handles a change in servings, a lower budget, an egg exclusion, missing prices, and a question requiring professional confirmation.
