# UX, Information Architecture, and Accessibility

> The current interface implements role selection, conversation, condition editing, meal cards, and shopping-summary preview. Some requirements below remain design or verification goals.

## Visual system and layout

- The interface shares the WAICY term-sheet palette: cool white `#F7F8FA`, white `#FFFFFF`, thin line `#DDE2EA`, title `#0E1B33`, action `#16315C`, and selected role `#DCE4F2`.
- Titles use Source Serif 4; Latin text and numerals use IBM Plex Sans. Traditional Chinese uses system serif/sans fonts. Secondary text uses higher-contrast `#596477`; input borders are darkened. See [source register](source-register.md) for origins and licenses.
- Desktop places conversation and meal results in the main column with condition editing beside them. Narrow screens sequence conversation, meals, and conditions. “Edit conditions” and “View N meals” provide in-page navigation.
- Role, form, meal, and summary states use text as well as color. Text enlargement and simple mode are available from the header.

## UX goals and current information architecture

Help older adults understand and begin with one sentence and few choices; help caregivers retain conditions; help family members organize shopping and unknowns. The AI must not speak as a medical authority or remove the older adult's choice.

Current routes include `/` for role selection and chat, plus `/evidence/waicy` for a read-only synthetic record. A future `/share/[token]` route is not implemented; it would require consent, de-identification, a read-only link, expiry, and withdrawal. Keep errors in plain language rather than exposing technical stacks.

## Main user flows

### A. Older adult planning dinner

1. Choose “I am preparing food for myself” and start from a simple example such as tofu, greens, NT$100, and a rice cooker.
2. Collect conditions in conversation and show an editable summary of people, budget, inventory, exclusions, and equipment.
3. Do not infer a health condition. Ask only necessary questions when a restriction is unclear.
4. Show up to three meal cards with on-hand ingredients, items to buy, price confidence, and short steps.
5. On “I don't like this,” “change an ingredient,” or “change servings,” update conditions and candidates and show what changed.

### B. Caregiver applying a confirmed restriction

1. Explain that the app uses restrictions the user confirms and does not need names or hospital records.
2. Keep a prohibited ingredient visible in the summary and indicate that it was applied.
3. Ask what ingredient to exclude when the restriction is vague; do not infer medical meaning.
4. Refer clinical questions to a doctor, pharmacist, or dietitian while retaining only practical meal conditions.

### C. Family member organizing shopping

1. Enter people, meals, budget, ingredients, and preferences.
2. Review meal directions and request a shopping summary.
3. Separate “already have,” “need to buy (known price/quantity),” and “price to confirm.” Never count an unknown price as zero.
4. Preview before copying a summary to share; remove unnecessary private information.

### D. Evaluator demo

The intended public flow is to open the site without private login, select a role, send a safe synthetic case to a live LLM, change a condition, and inspect the new answer. A separate evidence link should contain at least ten real final-version exchanges. Public deployment and external access are not yet verified. During service failure, state that the live service is unavailable and clearly label any saved evidence as recorded.

## Meal card content

- Meal name, serving count, equipment, and time (label estimates).
- Ingredients on hand and items still to buy.
- Cost state: calculated from user-provided prices, partially unknown, or known to exceed budget. Do not promise to stay under a budget.
- Applied preferences and exclusions, plus any restriction needing confirmation.
- Three to five short steps; do not remove important safety information just to shorten text.
- Actions: see simple steps, replace meal, edit conditions, and prepare a shopping summary.

## Language and interaction patterns

English is the default interface language; Traditional Chinese remains available. Keep both languages aligned in safety meaning and price status. Suggested English messages:

| Situation | Suggested wording |
|---|---|
| Price unknown | “I only have some of the prices, so I can’t confirm whether this fits your budget. What is the price of [item]?” |
| Conflicting needs | “With eggs excluded and only these ingredients available, there may be fewer options. Would you like to adjust the meal?” |
| Unclear medical restriction | “You mentioned a dietary restriction, but I don’t know which ingredient it applies to. I won’t guess; please confirm it first.” |
| Medication question | “I can’t determine whether this food is safe with your medication. Please check with your doctor or pharmacist.” |
| API failure | “I can’t get a new AI suggestion right now. Your conditions are still here; please try again later.” |

Never show fake “nutrition approved,” “100% safe,” or “pharmacist reviewed” badges.

## Accessibility goals (not a conformance claim)

- Use readable body text (target 18px or larger), generous line spacing, and clear hierarchy; do not put safety content in tiny gray text.
- Target at least 44×44 CSS px for primary touch targets and 4.5:1 contrast for normal text (WCAG AA reference); test actual colors.
- Support keyboard operation, visible focus, semantic headings/buttons, and suitable `aria-live` announcements.
- Do not communicate state through color, icons, or emoji alone.
- Avoid requiring health data or registration. Explain privacy before sharing.
- Offer simple and detailed presentation without changing validated hard restrictions.
- Support mobile first and desktop; do not hide essential information behind hover.
- Test readability with older adults and caregivers; disclose if target users were unavailable.

## UI acceptance checklist

- [ ] Three roles produce meaningfully different content.
- [ ] Users can start without filling many fields at once.
- [ ] Condition summary can be reviewed and edited each turn.
- [ ] Few candidates; price confidence and unknowns are visible.
- [ ] Keyboard can complete entry, conversation, edit, and results.
- [ ] The flow does not request names, medication names, prescriptions, or medical records.
- [ ] Any future public sharing has preview, consent, withdrawal, and expiry.
- [ ] Manual checks cover 200% zoom, screen reader, high contrast, and real devices.

## Recorded interface checks and interaction behavior

Playwright in Chromium checked widths of 320, 375, 768, 1024, and 1440 CSS px, role switching, condition forms, meal results, summary copy, and retry. Recorded contrast ratios were 5.62:1 for secondary text, 12.90:1 for the primary button, and 3.27:1 for input borders against white. Fonts load from the same origin.

Typed input and built-in examples use the same condition parser. The turn summary shows recognized people, budget, equipment, exclusions, and quote changes. Cards emphasize inventory for older adults, servings/exclusion checks for caregivers, and item-level shopping/unknown prices for family members. “Replace meal” text and button exclude the prior candidate. Multi-meal quantities use the same recipe scaling; heating estimates assume batches of about two servings and depend on equipment capacity.

For missing prices, cards show that the total is pending confirmation; known partial costs appear only as a subtotal. When inventory covers everything, the interface says no additional purchase is needed. Failed requests retain input and conditions; a successful retry shows the user message once. `/evidence/waicy` includes English instructions and turn summaries while preserving original Traditional Chinese conversation and model-participation labels.
