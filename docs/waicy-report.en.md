---
title: "CareKitchen"
subtitle: "Conversational meal planning for older adults and their families"
lang: en
---

::: {.report-opening}
**WAICY 2026 · Track 4 · LLM & AI Agent**

English technical report · November 28, 2026

[Open the live assistant](https://carekitchen-theta.vercel.app/) · [Read the final chat history](https://carekitchen-theta.vercel.app/evidence/waicy) · [Inspect project evidence](https://github.com/Sutdents-Project-Hub/CareKitchen/tree/main/docs/evidence)

## What the service does

CareKitchen helps older adults, caregivers, and relatives turn available food into a short list of meal options. A conversation keeps track of servings, pantry quantities, kitchen equipment, available time, purchase budget, and confirmed ingredient exclusions. When the user says “make it for 2” or “microwave only,” CareKitchen recalculates the options with the updated conditions. Each dish includes preparation steps, items to buy, and any amounts or prices that still need checking.

| Decision | What CareKitchen shows |
|---|---|
| What can I make today? | Up to three catalog dishes with suitable equipment, scaled quantities, and estimated preparation times |
| Will I go over budget? | The subtotal for whole packages at user-supplied prices and any gaps that prevent a full total |
| What has changed? | Recalculated servings, ingredients, and other conditions after a follow-up |
| How do I coordinate a purchase? | A preview of the ingredients at home and the items to buy, with a copy action |

## Motivation

In June 2025, 25.8% of registered Taiwan residents aged at least 65 belonged to one-person households. Household registration describes the household, while cooking arrangements and support may vary. (Taiwan Ministry of the Interior, 2025)

Whitelock and Ensaff (2018) held focus groups with 30 adults aged 63–90 in a UK city. Cooking and shopping for one, food costs, and help with food emerged in the discussions. Low et al. (2020) documented how social connection influenced food choices among 22 participants in an Australian qualitative study.

These findings led us to test three design ideas with fictional inputs: start a conversation with one serving, keep unknown prices visible, and make a shopping handoff readable on its own. The studies motivate those ideas. Their participants did not evaluate CareKitchen.
:::

::: {.print-page}
## Three intended users

| User profile | Everyday need | Interaction observed in the live walkthrough |
|---|---|---|
| Older adult cooking alone | Use what is at home and follow a manageable set of instructions | Two options for the shared input. The operator opened the steps for the first dish. |
| Family caregiver | Recalculate quantities after a change and see all confirmed exclusions | Three options for the shared input. After changing to three servings and excluding tofu, the operator saw steamed cabbage and carrots, with the egg restriction still visible. |
| Relative coordinating meals | Know what to buy and share a summary that omits the chat | Three options and a shopping response for the shared input. The operator previewed a dish with a purchase and an unconfirmed price. |

The shared input described two servings, tofu, leafy greens, a rice cooker, no eggs, and a NT$80 budget. The first suitable option was shared across the roles. The number of suggestions, follow-up checks, and actions differed. [Annotated comparison and screenshots](https://github.com/Sutdents-Project-Hub/CareKitchen/blob/main/docs/evidence/waicy-english-v6.md)

## How the assistant makes a decision

1. The server interprets the turn and checks required fields. It responds directly when it needs a supported appliance, sees an unresolved restriction, or detects a medical question.
2. It checks the fixed recipe catalog against servings, equipment, time, explicit exclusions, and known purchase costs.
3. GPT-6 Luna returns a structured action and orders eligible recipe IDs when model ranking is needed. The server gives priority to options that use more of the available pantry. The V6 prompt favors shorter preparation for the older adult, fewer unconfirmed quantities for the caregiver, and itemized purchases for the relative.
4. The website displays only eligible recipes. The “why” follow-up uses the last displayed dishes and their checkable properties. It does not infer the model’s private reasoning.

This design keeps costs and restrictions grounded in the user’s details even after a swap. The catalog is deliberately small. For chicken and white rice with a stovetop, the assistant reports the gap and asks how the user wants to proceed.
:::

::: {.print-page}
## Iterative development

The project moved from a general recipe response to an assistant that preserves meal conditions. Each change addresses an observed failure.

| Stage | Test and observation | Change and measured result |
|---|---|---|
| Initial baseline | A direct model response allocated only part of the cost of full packages in a budget case | The application calculates the cost of buying enough whole packages. In one later case it showed a minimum of NT$120 against a NT$100 limit and withheld the over-budget meals. |
| V1 to V2 | The Traditional Chinese suite exposed repeated questions and too few candidates | Required-condition checks moved to the server. Passing turns rose from 5/16 (29/56 checks) to 16/16 (56/56 checks). |
| V3 and V4 | Shopping intent, roles, and changes to known conditions needed distinct handling | Updated routing and constraint checks; both versions passed 16/16 turns in the historical Chinese suite. Some earlier prompt files are reconstructions. |
| English V5 | A separate English fixture checked role, price, and safety flows | 16/16 turns and 59/59 assertions passed. These cases differ from the historical Chinese suite. |
| English V6 | Short phrases from a judge-style review exposed failures in the deployed English app | Same-input comparison at the public URL. The revised version met all 12 targeted behaviors across the cases below. |

### V6 failures and same-input retest

| Prompt | Before | After |
|---|---|---|
| “Dinner for 1”, “for 2”, “for one”, “I live alone” | Serving size stayed blank | Stored 1, 2, 1, and 1 respectively; asked for equipment |
| “I have chicken and white rice.” (two servings, stovetop) | Returned unrelated dishes with no coverage explanation | Named the missing match and offered a next action |
| “I have eggs and tomatoes, and a stove.” | Dropped the ingredients from the mixed sentence | Saved both foods and ranked stovetop tomato and eggs first |
| “I want something different” / “Why did you choose these?” | Generic prompt to restate meal needs | Excluded the displayed IDs for the swap; explained the displayed dish using checkable facts |
| “I have an oven” | Stored the appliance as food | Kept the pantry intact and offered supported equipment |

The 12-case suite also covers a combined dinner request, switching to oven-only from a stovetop, and “Why these dishes?”. Every response returned HTTP 200. Model participation was one case on the original deployment and three on the revised deployment. The other cases use direct rules for clarification, coverage, or an evidence-based explanation. These counts describe a targeted synthetic regression suite. [Raw before and after outputs and dated V6 instructions](https://github.com/Sutdents-Project-Hub/CareKitchen/blob/main/docs/evidence/waicy-english-v6.md)
:::

::: {.print-page}
## Final live conversation

[Open the public conversation](https://carekitchen-theta.vercel.app/evidence/waicy) · [Try the same live assistant](https://carekitchen-theta.vercel.app/)

Codex operated the deployed English UI using Playwright and fictional meal details. The session contains **10 rounds, or 20 exchanged messages**, with **6 GPT-6 Luna ranking rounds**. The public transcript includes the actual messages and options.

| Round | User turn | What the live app did |
|---|---|---|
| 1 | Dinner for 1 | Stored one serving and asked for equipment |
| 2 | Eggs and tomatoes, stove, NT$80 | Suggested stovetop tomato and eggs first |
| 3 | Why did you choose these? | Explained the ingredients at home and purchase requirements for the previous options |
| 4 | I want something different | Showed different dishes and indicated they use other ingredients |
| 5 | Make it for 2, no eggs | Preserved the equipment and budget and identified the remaining pantry gap |
| 6 | Added tofu and greens | Offered a matching stovetop dish |
| 7 | Make a shopping list | Exposed what to buy and which prices still needed checking |
| 8 | Added a NT$45 pumpkin package price | Applied the supplied price when checking the displayed options |
| 9 | I only have an oven | Explained the appliance limitation and asked for a supported alternative |
| 10 | I only have a microwave | Returned microwave dishes and retained the serving count, egg exclusion, and budget |

### What the checks measured

- Browser execution covered the ten-round exchange, the three role flows, a shopping dialog opening and closing by keyboard, a 430 px viewport, and a medication referral without meal cards.
- Code verification used 62 local automated tests, lint, TypeScript, and a production build.
- The targeted tests measure visible behavior with fictional data. Effects on older adults’ independent cooking, dietary quality, and caregiver workload remain unknown.
:::

::: {.print-page}
## Original contributions and dependencies

| Source | Role in the project |
|---|---|
| CareKitchen implementation | The project-specific meal catalog, condition editor, parsing and conversation flow, recipe filtering, whole-package pricing rules, role guidance, and test cases |
| OpenAI GPT-6 Luna | Structured intent and ranking for candidates already checked by the server |
| Next.js, React, TypeScript, Zod, Vercel | Application framework, libraries, and hosting |
| Published statistics and research | Motivation and scenario design |
| Codex and Claude | AI assistance in implementation, testing, research, and drafting as detailed in the project disclosure |

[AI use and project contributions](https://github.com/Sutdents-Project-Hub/CareKitchen/blob/main/docs/waicy-submission/ai-use-disclosure.md)

## Limitations and considerations

- **Coverage.** The catalog covers a limited set of foods and appliances. Users may need to add an ingredient, choose another method, or look elsewhere for cooking guidance.
- **Prices and quantities.** Package prices and pantry amounts come from the user. A subtotal can remain incomplete. Actual prices, stock, and equipment capacity may differ.
- **Medical scope.** The prototype checks listed ingredients against confirmed exclusions. Packaging labels, preparation environments, allergies, medication, and disease-specific diets need appropriate professional judgment.
- **Privacy and autonomy.** Use fictional details in demos. AI mode sends selected turn details to OpenAI, with response storage disabled in the request. Users review the shopping summary before copying it. The project has no server-side conversation history.
- **Testing.** Tests are authored by the project and cover a small set of inputs. Real users and qualified clinical reviewers have not evaluated the prototype.

## Future development

1. Observe consenting older adults, caregivers, and relatives completing three short fictional tasks. Record where they ask for help, miss price uncertainty, or lose a constraint.
2. Expand the recipe catalog by equipment and pantry coverage. Review each addition for complete ingredients, preparation steps, equivalent translations, and exclusion checks.
3. Repeat tests on unseen language across sessions and devices. Report how often a valid request succeeds, clarification helps the user resume, and a constraint is retained.

## Conclusion

CareKitchen gives users practical choices while keeping their meal conditions visible. The V6 results show how traceable failures can lead to a better conversation, including recognizing ordinary English, using the available pantry, and explaining an unsupported request. The next question is whether these interactions make meal planning easier for the people the service is designed to support.
:::

::: {.print-page}
## References

CareKitchen. (2026). *CareKitchen source code, prompts, and evaluation records*. GitHub. [Repository](https://github.com/Sutdents-Project-Hub/CareKitchen)

Department of Statistics, Ministry of the Interior, Taiwan. (2025, November 29). *Weekly interior statistics, week 48: Residents aged 65 and older in June 2025*. [Original bulletin](https://www.moi.gov.tw/News_Content.aspx?Create=1&n=9&s=334815&sms=9009)

Low, E., Kellett, J., Bacon, R., & Naumovski, N. (2020). Food habits of older Australians living alone in the Australian Capital Territory. *Geriatrics, 5*(3), 55. [Original study](https://pubmed.ncbi.nlm.nih.gov/32962146/)

OpenAI. (n.d.). *Structured outputs*. [API documentation](https://developers.openai.com/api/docs/guides/structured-outputs)

Vercel. (n.d.). *Next.js App Router*. [Framework documentation](https://nextjs.org/docs/app)

WAICY. (2026). *WAICY 2026 guidebook*. [Track 4 guidance, pp. 20–23](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf)

WAICY. (2026). *WAICY 2026 rubrics*. [Large Language Models criteria](https://www.waicy.org/rubrics/)

Whitelock, E., & Ensaff, H. (2018). On your own: Older adults’ food choice and dietary habits. *Nutrients, 10*(4), 413. [Original study](https://doi.org/10.3390/nu10040413)
:::
