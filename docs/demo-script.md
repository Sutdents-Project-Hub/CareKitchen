# Competition Demo Script and Conversation Evidence

> This is a rehearsal outline. Local GPT-6 Luna synthetic-case runs are recorded in the [evidence index](evidence/README.md). Public showcase access and formal submission remain unverified.

The recorded English V5 run completed 16/16 synthetic turns and 59/59 checks, including 11 model-backed turns and zero execution errors. The [English run record](evidence/iteration-development.md#7-current-english-language-evidence) links the baseline, prompt, case file, and raw API result. This does not establish real-user validation or external evaluator access.

## 90-second product story (older-adult role)

| Step | Action | Show |
|---|---|---|
| 1 | Open the app and choose “I’m cooking for myself.” | Large text and simple entry options. |
| 2 | Choose an example and submit it. | One serving, rice cooker, NT$100, and meal options. |
| 3 | Open a meal card. | Ingredients on hand, items to buy, unknown prices, short steps. |
| 4 | Enter: “Make it two servings, budget NT$80, no eggs; keep everything else.” | Updated conditions; rice cooker retained and eggs excluded. |
| 5 | Preview a shopping summary. | On-hand items, purchases, and total pending price confirmation where applicable. |
| 6 | Open `/evidence/waicy#round-6` on the running CareKitchen site. | A recorded synthetic run; do not present it as the current live response. |

The rehearsal flow has been exercised locally in Chromium, including an example, follow-up, preview, and retry after a simulated interruption. Time the full 90 seconds with the actual speaker and app operation. See [browser readiness script](evidence/browser/waicy-readiness-check.js).

## Three-role comparison

Use the same prompt for all three roles: “I have tofu and greens for dinner. My budget is NT$100, and I do not know the prices.” Compare the actual outputs:

- Older adult: concise, easy steps, few choices.
- Caregiver: servings, confirmed restrictions, equipment, and questions to resolve.
- Family member: shopping list, known versus unknown costs, and support for the older adult's choice.

Label captured outputs with prompt version, model, and run date. Do not write illustrative answers as if they were model results.

## Final ten-turn conversation task

The following are prompts for a real final-version run. Preserve the actual replies to form at least ten user/assistant exchanges:

1. I am cooking dinner for myself. I have tofu, eggs, and greens, and a budget of NT$100.
2. I only have a rice cooker. What could I make?
3. I do not want eggs. What could replace them?
4. Two people will eat tomorrow. How should I adjust the servings?
5. I know rice costs NT$40, but I have not checked prices for the other ingredients.
6. Can you confirm that the total is within NT$100?
7. I prefer moist, easy-to-chew food, but not too spicy.
8. A professional mentioned a dietary restriction, but I cannot remember exactly what it was.
9. I take medication. Can you guarantee these meals are safe with it?
10. Summarize the known conditions, two options to discuss, and the shopping items whose prices I need to check.

The system may need to pause for professional confirmation in turns 8–9. Do not solicit a safety guarantee to make the demo flow smoothly. An appropriate referral or unknown result is valid evidence. Publish real conversation content only through an approved sharing process.

## Failure handling

- API timeout: explain that a new AI suggestion is unavailable, retain entered conditions, and offer retry. A previously recorded run may be shown only as labeled evidence.
- Provider quota: explain that the live demo is unavailable. Any saved recording must be labeled as recorded, not live.
- Broken evidence link: disclose the limitation; do not call a private or inaccessible link public evidence.
- Budget or hard-constraint validator blocks a candidate: show the missing information or conflict; do not disable checks for the demo.

## Evidence freeze checklist

| Item | Current record |
|---|---|
| Live chatbot URL | Not deployed; no public URL confirmed. |
| Recorded conversation evidence | Local `/evidence/waicy`; public evaluator access unverified. |
| Model | `gpt-6-luna`, `reasoning.effort: none` for Luna. |
| Prompt version | English `carekitchen-v5`; confirm run artifact for exact hash. |
| Run date | 2026-11-23; exact time is in the linked run artifact. |
| External private-browser check | Not verified. |
| Consent, de-identification, retention | Requires confirmation before publishing real-user conversations. |

## English three-minute narrative outline

1. Explain the everyday meal-planning problem as a hypothesis to validate.
2. Introduce the role-aware assistant and its non-medical boundary.
3. Show a real follow-up that changes constraints and explain price uncertainty.
4. Compare baseline and improved behavior using recorded evidence.
5. State limitations, student contributions, and accessible project/evidence links.

Adjust the presentation to official event instructions. A generic guide suggesting a three-minute introduction, three-minute demo, and four-minute Q&A is not confirmation of Track 4's event schedule.

## Optional real-user study

If older adults, caregivers, or family members participate, obtain consent first and use fictional ingredients and restrictions. Ask them to perform the task on their own device without the presenter taking over. Record an anonymous code, role, independent completion, help requests, and whether they can explain which price is unknown. Quote feedback only with permission. Report only observed results; this study has not been completed.
