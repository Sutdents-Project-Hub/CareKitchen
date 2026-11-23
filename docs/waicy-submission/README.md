# WAICY 2026: English Submission Materials

> **Status as of November 24, 2026:** the repository contains a 27-slide English deck source, built on the English V5 evidence, and an English screenshot appendix. The public assistant and transcript URLs, verified team information, contribution statement and final submission PDF are pending.

## Contents

| File | Purpose |
|---|---|
| [project-description.md](project-description.md) | Copy-ready project description, under 200 words |
| [rubric-mapping.md](rubric-mapping.md) | Mapping of official criteria and required content to deck pages, evidence, and gaps |
| [submission-todo.md](submission-todo.md) | Outstanding items, locations, and submission blockers |
| [research-notes.md](research-notes.md) | Source register, verification status, and excluded claims |
| [`deck-source/`](deck-source/) | Editable source for the 27-slide Claude Slides deck |

## Deck status and export

- The latest deck source follows the Term Sheet style and uses the current [English interface, live responses and transcript screenshots](../evidence/waicy-pdf-materials/README.md).
- The owner-only [Claude artifact](https://claude.ai/artifact/4kcWQeX2UYXPjrXtPrSbbY) was updated on November 24, 2026 to match this source, including the English screenshots. Review it, then choose **Share → Export** for the PDF.
- After confirming the division, use `LLM_High_CareKitchen.pdf` and the `LLM_High_CareKitchen` Drive folder for a high-school entry.

## Editable deck source

`deck-source/project/` contains `deck.json` (order and fonts), `deck.css` (shared styles), and `slides/*.html`. Images in the source reference uploaded assets of the Claude artifact (`/_blob/…`), so they display only inside that artifact. The same screenshots are in [`../evidence/waicy-pdf-materials/screenshots/`](../evidence/waicy-pdf-materials/screenshots/); to rebuild elsewhere, upload them and replace each `src`.

## Slide sequence

1 Cover · 2 Summary · 3 Motivation (international evidence) · 4 Gaps in general chatbots · 5 Service definition · 6 User flow · 7 The English prototype · 8 Agent design · 9 Three users · 10 Same prompt, three outputs · 11 Price transparency · 12 Live dialogue · 13 Safety boundaries · 14 Concept evolution · 15 Prompt versions · 16 Results (V1–V5) · 17–18 Failure analysis · 19 New-case test · 20 Public links (pending) · 21 Ten-turn English record · 22 Limitations · 23 Ethics · 24 Future work · 25 Originality and team contribution (pending) · 26 Conclusion · 27 References.
