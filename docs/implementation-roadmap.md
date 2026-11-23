# Implementation Roadmap and Acceptance Gates

> The current local prototype includes the web framework, three roles, editable conditions, multi-turn planning, rule checks, meal cards, shopping preview, and OpenAI integration. Real API calls, synthetic fixed-suite comparisons, and a local read-only conversation record are documented. The full 30-case suite, real-user usability study, public deployment, formal submission, and external-link acceptance remain incomplete or unverified. See the [Web README](../web/README.md) and [evaluation plan](evaluation-and-iteration.md).

The WAICY goal is a clear AI service with evidence of iteration, not the largest feature set. All dates below are planning history, not a current schedule or official deadline.

## Working principles

- Read `AGENTS.md`, `README.md`, product spec, architecture, agent design, evaluation plan, and competition rules before changing scope.
- Keep the only executable component in `web/`, with Next.js App Router. Do not create a nested `web/<project>/` wrapper.
- Build one observable end-to-end flow before expanding it.
- Preserve actual prompt versions, source commits, manual checks, and failures.
- Model API usage, paid services, cloud databases, public deployment, and GitHub pushes require the applicable authorization and external configuration; a plan is not authorization.

## Phases and gates

| Phase | Work | Acceptance gate |
|---|---|---|
| P0-a: framework and UI | Official Next.js setup, quality scripts, role entry, chat layout | Actual lint/typecheck/build; UI works locally, not represented as AI success. |
| P0-b: real model turn | Server-only provider adapter, real chat, role prompt, error display | Approved provider/settings; real outputs; no client secret. |
| P0-c: multi-turn planning | Canonical state, ingredients, equipment, servings, 2–3 candidates | Second-turn edits persist; basic CK-01–05. |
| P0-d: safety and cost | Deterministic budget/restriction checks and professional referral | Unknown, over-budget, and medication cases handled; CK-T11–T28. |
| P0-e: user-facing results | Shopping summary, simple mode, role flows | UX and accessibility review; no unsupported safety claims. |
| P0-f: evaluation | Baseline/version comparisons, failures, fixes, raw evidence | Reproducible results and recorded limitations. |
| P0-g: public evaluator experience | Authorized hosting, accessible conversation evidence, de-identification | Private-browser test and public link checks; hosting/persistence approved. |
| P0-h: English report | Evidence-backed PDF, figures, third-party usability checks, Q&A | Every claim links to actual evidence; non-developer checks links. |
| Submit | Recheck official rules and submit through required channels | Actual submission receipt; do not report planned submission as complete. |

Dates in older plans were proposed pacing and are not commitments. Verify official WAICY rules and deadlines before acting.

## Work packages

1. **Framework:** keep manifests and lockfile directly under `web/`; use safe environment placeholders; verify only commands that exist.
2. **Roles and chat:** build A/B/C entry, quick intents, input, and condition summary; test mobile and keyboard; label any non-AI demo as such.
3. **Provider integration:** use an approved server-only adapter, timeout, quota/rate limits, output schema, model/prompt metadata, and honest upstream error handling.
4. **Deterministic conditions and budget:** validate `MealContext`, merge updates, preserve exclusions/equipment, track price source/unit, and calculate known additional purchase cost. Test AC-02/03/05/06/07/09.
5. **Meal cards and summary:** show candidates, purchases, price confidence, confirmed conditions, and readable steps; copy only after user review.
6. **Baseline and iteration:** fix cases before runs, preserve baseline and all outputs, score failures, and avoid attributing system improvements to prompt alone.
7. **Public demo and read-only evidence:** authorize hosting first; verify actual public access, real turns, a final conversation of at least ten exchanges, and removal of sensitive information. Sharing requires a consent and deletion design.
8. **English report:** cite real results, role comparison, failure/fix examples, ethical limits, and student contributions. Do not present plans, synthetic ideal samples, or unrun cases as experiments.

## Student and tool contributions

| Work | Student contribution to preserve | AI/advisor assistance may include |
|---|---|---|
| Problem and personas | Problem framing, needs, usability feedback | Interview prompts and analysis |
| Prompt design | Drafts, failure analysis, proposed revisions | Formatting and refactoring |
| Experiments and ethics | Case definitions, failure labels, scoring | Automated replay |
| Web and API | Ability to explain architecture and behavior | Implementation assistance |
| English report | Explain results, contributions, and decisions | Translation, layout, proofreading |

Report actual work by each contributor; retain notes, versions, outputs, and review evidence.

## Definition of done

- [ ] Implementation maps to product-spec acceptance criteria and adds no medical capability.
- [ ] Normal, unknown-price, conflict, and API-failure cases are covered as appropriate.
- [ ] Verification output is real; unresolved failures are disclosed.
- [ ] No key, personal data, student data, or real `.env` enters Git.
- [ ] API/state/prompt/UI/deployment changes update relevant documentation.
- [ ] Required approvals exist for architecture, paid service, and personal-data policy changes.
- [ ] Public copy makes no unsupported claim about judge access, scores, or professional endorsement.

Do not prioritize accounts, health records, full calendars, weekly menus, precise nutrition calculations, medication recognition, multi-agent systems, native apps, vector databases, live price scraping, or microservices. Evidence-backed improvement to the multi-turn experience matters more than stack size.
