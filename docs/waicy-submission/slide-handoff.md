# CareKitchen Presentation Handoff

Use the updated English technical report and the V6 evidence below when editing the existing 33-page deck. The private deck remains the source for team details.

| Page | What to show | Evidence and wording |
|---|---|---|
| 4 · Motivation | Taiwan one-person households and two study-linked design choices | In June 2025, 25.8% of registered residents aged 65+ lived in one-person households. A UK focus-group study identified cooking and shopping for one and food costs as topics. Describe these as motivation. [Sources and inference](research-notes.md) |
| 10 · Three roles | Start with the same prompt, then show each role’s actual task | Elder opens the steps, caregiver changes to three servings and excludes tofu while keeping the egg exclusion, relative previews a purchase with an unknown price. The initial top dish was shared. [Role images](deck-source/project/assets/) · [Raw role responses](../evidence/runs/english-v6-live-walkthrough.json) |
| 12 · Final prompt | V6 and the two parts of the decision | GPT-6 Luna ranks eligible IDs. Server code validates the recipe and recalculates known constraints. [Full V6 prompt](../evidence/prompts/english-v6.txt) |
| 24 · Iteration | Use examples with visible before-and-after behavior | Same 12 inputs and starting states on the old and new app. 12/12 new behaviors passed. The selected test suite targets reported failures. [Comparison](../evidence/waicy-english-v6.md) |
| 25–26 · Links and chat | Open the deployed assistant and the 10-round public chat | Codex operated the deployed version with fictional inputs. Six rounds used GPT-6 Luna. The user and assistant exchanged 20 messages. [Live assistant](https://carekitchen-theta.vercel.app/) · [Live record](https://carekitchen-theta.vercel.app/evidence/waicy) |
| 30 · Originality | State what the product contributes and identify its dependencies | Project code implements the pantry and condition editor, catalog, server-side eligibility, full-package pricing, and preserved constraints. GPT-6 Luna ranks the permitted candidates. Next.js and Vercel supply the framework and hosting. Published sources inform the problem. [AI use disclosure](ai-use-disclosure.md) |
| 31 · Team | Each student discusses the work they can explain and substantiate | Use the verified names and contribution notes supplied by the team. |

## Live demo and likely questions

1. Pick **Cooking for myself** and send “Dinner for 1”. Point out that only equipment is missing.
2. Send “I have eggs 2 items and tomatoes 300 g, and a stove. My budget is NT$80.” Open the first dish and ask “Why did you choose these?”
3. Send “Make it for 2, no eggs. Keep everything else.” Point out that the stovetop tomato and egg dish disappears. Then send “I also have tofu 300 g and leafy greens 240 g.” Open a result.
4. In the family role, use the shared two-serving example from page 10 and open the shopping preview for a dish that requires a purchase. Point to the price that still needs confirmation.

**Why use a small recipe catalog?** Each recipe has ingredients, amounts, equipment and steps the app can inspect. When it cannot match the pantry, it can state the gap and offer the user a choice.

**Where is the AI?** GPT-6 Luna returns a structured action and ranking. The application separately applies servings, equipment, exclusions and shopping rules to decide what can appear.

**Does it work for older adults?** The cited studies motivated the scenarios. The deployed prototype passed engineering tests with fictional details and was operated by an agent. Target-user usability remains to be measured.

**Why are two cards from different roles allowed to overlap?** The same eligible recipe may suit more than one household. The role changes how the app prioritizes eligible choices and what the user can do next.

Keep the private team page, select only the relevant screens for presentation, and use the PDF report as the written requirements document.
