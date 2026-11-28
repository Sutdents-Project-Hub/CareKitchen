# English V6 Judge-Facing Retest

A structured set of short English requests reproduces the problems found in the November 28 review. The inputs are fictional. Each comparison checks the response and structured meal conditions before and after the repair. A live browser walkthrough also checks controls and preserves the complete final exchange.

The judge-facing update adds informal serving counts, prevents appliance names from entering the pantry, prioritizes ingredients already available, adds a stovetop eggs-and-tomatoes dish, and supports ordinary swap and explanation requests. The [English V6 model instructions](prompts/english-v6.txt) describe how the three roles affect ranking within the eligible options.

The first production browser run revealed that changing pantry text could move the equipment controls as soon as the field lost focus. The follow-up revision synchronizes pantry state while typing so the first click remains actionable. It also omits explicitly excluded pantry items from messages about missing recipe coverage.

## Production comparison

All 12 rows had the same input, starting context, and previous option IDs. These are intentionally selected regression cases. A passing row meets the narrow behavior listed below.

| Behavior checked | Prompts | Prior deployment | Final deployment |
|---|---:|---|---|
| Save a short serving reply and ask for the missing equipment | 4 | No count saved | 1, 2, 1, and 1 saved |
| Report the chicken and white-rice coverage gap on a stovetop | 1 | Two unrelated options | Names the gap and offers a next action |
| Retain egg and tomato in a mixed appliance/pantry message | 2 | Pantry items dropped | Stovetop tomato and eggs ranked first |
| Offer an alternative without repeating the displayed dish | 1 | Generic question | Fresh eligible options |
| Explain the displayed dish by title and actual conditions | 2 | Generic question | Kept and explained the displayed dish |
| Keep the pantry free of appliance names and recover from oven-only | 2 | Oven put in pantry | Asks for an appliance the catalog supports |
| **Total** | **12** | **0/12** | **12/12** |

All 24 requests returned HTTP 200. One old turn and three new turns included GPT-6 Luna decisions. The other cases check local behavior such as clarifications and explanations. The target requirements focus on observed defects; the comparison does not estimate overall accuracy.

- [Before raw requests and responses](runs/english-v6-judge-before.json) · deployment of commit `5ee8ecb`
- [After raw requests and responses](runs/english-v6-judge-after.json) · deployment of commit `2865717`
- [English V5 historical suite](runs/luna-english-v5.json) · different prompts, 16/16 passing turns and 59/59 passing checks
- [Final browser record](runs/english-v6-live-walkthrough.json) · 10 turns, 6 model-backed turns, three role flows, medication referral, Escape/focus restoration, and the successful first equipment click
- [Public chat history](https://carekitchen-theta.vercel.app/evidence/waicy) · [Repository transcript](waicy-chat-history.md)

## Role walkthrough

The shared input gave two servings, tofu, greens, a rice cooker, no eggs and a NT$80 budget. Each role initially received rice-cooker tofu and leafy greens first. The older adult saw two choices and opened the cooking steps. The caregiver saw three choices, then changed to three servings and excluded tofu. The first option became steamed cabbage and carrots with both restrictions shown. The relative saw three choices and opened a summary for steamed mushrooms and tofu, with the purchase and unknown price visible. [Screenshots](../waicy-submission/deck-source/project/assets/) · [Raw per-role results](runs/english-v6-live-walkthrough.json)

The test operator was Codex via Playwright. The live model and browser interactions are real. Meal details and user roles are fictional and derived from the project's scenarios. Product effects for older adults or households require separate evidence.
