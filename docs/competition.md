# WAICY 2026: CareKitchen Submission and Judge Preparation

> **Status snapshot: November 23, 2026.** The local prototype has recorded a new-case retest and a ten-exchange synthetic dialogue, with an English judge guide. The public judge URL, verified student contribution, final English PDF, and formal submission are outstanding. See the [English report draft](waicy-report.en.md) and [evaluation evidence](evidence/README.md).

## 1. Schedule and official links

| Item | Current project record |
|---|---|
| Global submission deadline | Previously recorded as November 29, 2026, 17:00 EST (November 30, 06:00 Taiwan time); reconfirm directly with WAICY. |
| Internal target | Upload before the final evening, if the team is ready. |
| Final round | Previously recorded as December 4–6, 2026; organizer notice controls the actual schedule. |
| Event | [WAICY 2026](https://www.waicy.org/waicy-2026/) |
| Track guide | [WAICY 2026 Guidebook (PDF)](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf) |
| Rubric | [WAICY rubrics](https://www.waicy.org/rubrics/) |
| Submission | [WAICY 2026 submission form](https://www.waicy.org/2026-submission/) |
| Organizer contact | info@waicy.org |

The intended track is **LLM & AI Agent (AI as a Service)**. Team eligibility, age division, rules for teams above five members, and presentation timing must be confirmed with the current official materials or organizer; do not infer them from this project document.

## 2. Official scoring framework

| Criterion | Points | Evidence the project should present |
|---|---:|---|
| Specific AI Service | 25 | A clear service, three roles, and a genuinely usable function |
| Iterative Development | 25 | Initial version → test → failure → fix → same-case retest, with original outputs |
| Motivation & Problem Statement | 10 | A real older-adult meal-planning need supported by evidence; separate evidence from the design hypothesis |
| Limitations & Considerations | 10 | Medication/safety limits, unknown prices, privacy, and user autonomy |
| Future Development & Clear Reference | 10 | Actionable future steps and traceable references |
| Presentation & Communication | 10 | Clear English explanation and demo, with answers to judge questions |
| Originality & Creativity | 10 | A distinct combination of roles, budget, pantry ingredients, restrictions, and multi-turn changes |

The two 25-point criteria make recorded iteration and a clear service central to the submission. Rubric wording should be verified against the current [official rubric](https://www.waicy.org/rubrics/).

## 3. Required content for the PDF

The current project interpretation of the guidebook calls for one PDF with:

1. Specific AI service and its core behavior.
2. At least three user profiles with different needs.
3. Motivation, distinguishing verified facts from assumptions.
4. A final chat-history link. The project prepares at least ten complete question-and-answer turns as a conservative target; do not present this target as an extra official threshold unless the guidebook says so.
5. A reviewer-accessible link to the actual AI assistant, not only a video or fixed script.
6. Iterative AI design, including prompts, same-case tests, failure analysis, fixes, and retests.
7. Limitations, safety, ethics, privacy, and incomplete work.
8. Future development clearly labelled as future work.
9. Conclusion and verified student contribution.
10. References that can be traced to the original sources.

The Guidebook's exact requirements take precedence. See the [official guide](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf), [iteration record](evidence/iteration-development.md), and [submission checklist](waicy-submission/submission-todo.md).

## 4. Working 12-page PDF outline

| Page | Content |
|---:|---|
| 1 | CareKitchen, project/student, track |
| 2 | Problem and motivation |
| 3 | Specific AI service and value |
| 4 | Three personas and personalization |
| 5 | User journey and agent workflow |
| 6 | Direct baseline and first prompt |
| 7 | Evaluation cases and scoring rules |
| 8 | Historical V1–V4 results and the separate English V5 suite; qualitative baseline comparisons |
| 9 | Failure analysis, fixes, and retests |
| 10 | **Live assistant URL and final chat transcript URL** |
| 11 | Limitations, privacy, safety, and future work |
| 12 | Conclusion, student contributions, and references |

The existing 26-slide draft is more detailed; this shorter outline is a planning reference. Current results include a 16-turn comparison, a five-turn conversational edge run, and the pre-submission challenge/regression runs. See the [evidence record](evidence/iteration-development.md).

### Deck design specification

The user-selected **Term Sheet** theme is for presentation slides. It uses a flat cool-white `#F7F8FA` background; Source Serif 4 headlines in navy; IBM Plex Sans for labels and data; structured grids, ruled tables, white cards with thin borders, and one pale-blue panel. It avoids gradients, decorative icons, shadows, rounded blobs, multiple accent hues, and centered body paragraphs. Website-specific design is documented separately in [user flows and accessibility](ux-and-user-flows.md).

## 5. Submission folder and form

- If the team confirms High School division, the planned Google Drive folder and PDF name are `LLM_High_CareKitchen` and `LLM_High_CareKitchen.pdf`.
- The form was recorded on November 23 as requesting country, track, project title, participation type, a project description up to 200 English words, contact/team details, division, and a Drive-folder link readable by anyone with access. Verify the live form. Teacher and regional-host details depend on the team's situation. A team submits once; if a regional organizer already registered the team, confirm the process with them first. See the [official form](https://www.waicy.org/2026-submission/) and [draft description](waicy-submission/project-description.md).
- Test both links in the PDF independently: the assistant must be usable, and the final conversation must be readable.
- Check sharing permissions, login requirements, paid walls, expiration, and rate limits from a logged-out browser and another device.
- Save the actual submission confirmation. A clicked submit button alone is not proof of acceptance.

## 6. Readiness checklist

- [ ] Confirm eligibility and deadline from current official guidance.
- [x] Local same-prompt comparison for all three roles.
- [x] Local synthetic ten-turn dialogue preserves changing conditions and asks when required information is missing.
- [x] Fixed cases cover unknown prices, package-level budget overrun, and professional referral.
- [ ] Run a complete 30-case or otherwise required evaluation, with inspectable results.
- [x] At least one real failure → fix → same-case retest is recorded in the [iteration log](evidence/iteration-development.md).
- [x] A ten-round synthetic transcript recorded with the final prompt is publicly readable ([web](https://carekitchen-theta.vercel.app/evidence/waicy), [repository copy](evidence/waicy-chat-history.md)). It was recorded on a local build of the same code, not on the hosted instance.
- [x] Assistant URL works in a headless browser without a sign-in (checked November 27, 2026).
- [ ] Verify student contribution and two public links; export the final English PDF.
- [ ] Test Drive access and every PDF link externally.
- [ ] Save submission receipt or confirmation screenshot.

## 7. Likely judge questions

**Why not just use ChatGPT?** The project does not claim to be categorically better. It compares the same model and cases to show how role context, hard-constraint retention, cost transparency, and risk escalation changed the tested workflow.

**What did the student build?** State what the student personally did in problem research, prompt iteration, case design, evaluation, product decisions, implementation, testing, and presentation. Disclose any work by Codex, Claude, mentors, or other contributors accurately.

**What happens when the AI is wrong?** The system can expose uncertainty, ask for missing details, refer higher-risk questions to professionals, and use server checks and failure tests to reduce known errors. It does not guarantee error-free output.

## 8. Demo scenario outline

- **Case 1:** An older adult has tofu, greens, a NT$100 shopping budget, and a rice cooker. Ask for required missing details, then show two candidates without inventing prices.
- **Case 2:** “No egg, make it two servings, budget NT$80.” Show retained conditions and a fresh candidate check.
- **Case 3:** A caregiver supplies a confirmed restriction. Distinguish an applied restriction from one that still needs confirmation.
- **Case 4:** A relative requests a shopping summary. Separate pantry items, purchases, and unknown prices.
- **Case 5:** A medication or food-safety question. Do not make a clinical determination; refer to a pharmacist or clinician.

A demo script is not a final ten-turn transcript. The transcript must be generated from the final deployed assistant. See [demo script](demo-script.md).

## 9. English deck and submission materials

A 32-page English deck was completed on November 27, 2026 and exported as `LLM_Middle_CareKitchen.pdf` (Middle School). The PDF holds student names and photos and is kept outside this public repository. See [submission materials](waicy-submission/README.md), [rubric mapping](waicy-submission/rubric-mapping.md), [checklist](waicy-submission/submission-todo.md), and [research notes](waicy-submission/research-notes.md).
