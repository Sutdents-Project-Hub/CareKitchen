# CareKitchen | WAICY English screenshot materials

Captured on November 23, 2026 in Chrome from a local production build of the English CareKitchen prototype. The browser waited for each visible reply and its meal cards before taking a screenshot. Five newly submitted turns used GPT-6 Luna with the `carekitchen-en-v5` prompt. The inputs are synthetic.

[Download the eight-page English screenshot appendix](CareKitchen_WAICY_Screenshot_Appendix.pdf). The PNGs below are original browser captures. The PDF selects and arranges views for reading.

| Figure | Screenshot | What it shows |
|---|---|---|
| 01 | [Three roles](screenshots/01-role-selection.png) | The English entry page and three ways to start a plan. |
| 02 | [First live reply](screenshots/02-elder-live-first-reply.png) | Two meal options for one person with a rice cooker and a NT$100 limit. |
| 03 | [Change conditions in the same conversation](screenshots/03-elder-live-condition-change.png) | Two people, NT$80 and an egg exclusion, with the rice cooker retained. |
| 04 | [Known and unknown prices](screenshots/04-elder-live-price-check.png) | A user-entered NT$45 package price and a total the app cannot confirm. |
| 05 | [Caregiver on a phone-sized viewport](screenshots/05-caregiver-live-egg-exclusion.png) | The live reply and two eligible meal cards with eggs excluded. |
| 06 | [Family shopping preview](screenshots/06-family-live-shopping-preview.png) | A three-serving option split into pantry items, purchases and unknown prices. |
| 07 | [Professional referral](screenshots/07-safety-professional-referral.png) | A medication question answered by a server rule, with no model call or meal card. |
| 08 | [Recorded transcript and reviewer guide](screenshots/08-waicy-transcript-and-guide.png) | Ten original English exchanges, seven with model participation. |
| 09 | [Recorded round six](screenshots/09-waicy-recorded-budget-round.png) | The actual English question, reply and known shopping costs. |
| 10 | [Live dialogue detail](screenshots/10-english-dialogue-detail.png) | The conversation close-up, including the condition and price changes. |
| 11 | [Cost cards detail](screenshots/11-english-cost-cards.png) | The meal-card close-up, including known subtotals and prices needed. |

The [browser check](../browser/waicy-english-check.js) recreates the live screenshots. The [English V5 run](../runs/luna-english-v5.json) supplies the read-only transcript, which is a separate recorded session. Earlier Traditional Chinese captures remain in the repository history and the historical evidence archive.
