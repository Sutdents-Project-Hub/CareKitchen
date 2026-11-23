# CareKitchen | AI Meal Planning for Older Adults

CareKitchen is a WAICY 2026 Track 4 conversational meal-planning prototype for older adults living alone, family caregivers, and family members. It helps users discuss practical meals using ingredients on hand, user-supplied prices and budget, available equipment, preferences, and dietary restrictions the user has confirmed.

CareKitchen is not a medical, medication-interaction, nutrition-prescription, or food-safety assessment service. Unknown prices remain unknown; the app does not invent exact costs or guarantee a real checkout total.

## Current prototype

- Choose one of three roles and continue a conversation while editing meal conditions.
- Review up to three meal candidates with steps, ingredients on hand, items to buy, and price confidence.
- Server-side checks recalculate costs from user-provided package prices and filter known budget or explicit-restriction conflicts.
- English is the default interface language; Traditional Chinese remains available. English requests may specify `language: "en"`; older callers that omit it retain the existing Chinese behavior.
- The recorded English GPT-6 Luna V5 run completed 16/16 synthetic turns with 59/59 checks, 11 model-backed turns, and zero execution errors. This is engineering evidence from synthetic cases, not real-user or external evaluator validation. See the [English run record](docs/evidence/iteration-development.md#7-current-english-language-evidence) and [evidence index](docs/evidence/README.md).

## Local development

The only executable component is [web/](web/README.md), built with Next.js App Router, TypeScript, Node.js 24 LTS, and pnpm 10.

```sh
cd web
pnpm install --frozen-lockfile
pnpm dev
```

The local entry point is `http://localhost:3000`. To use OpenAI, copy `web/.env.example` to `web/.env.local` and set an authorized `OPENAI_API_KEY`. The default model is `gpt-6-luna`; `OPENAI_MODEL` can override it. See the [Web README](web/README.md) for modes and errors.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` from `web/`. Local rules, mocks, and synthetic runs are not competition-model evaluations or external acceptance.

## Project documents

- [Project overview](docs/project-overview.md) · [Product specification](docs/product-spec.md) · [Implementation roadmap](docs/implementation-roadmap.md)
- [Architecture](docs/architecture.md) · [API and data contracts](docs/api-and-data-contracts.md) · [Agent design](docs/agent-design.md) · [OpenAI integration](docs/integrations.md)
- [UX and user flows](docs/ux-and-user-flows.md) · [Security and privacy](docs/security-and-privacy.md) · [Data and storage](docs/data-and-storage.md)
- [Evaluation evidence](docs/evidence/README.md) · [Iteration log](docs/evidence/iteration-development.md) · [Evaluation plan](docs/evaluation-and-iteration.md) · [Demo script](docs/demo-script.md) · [Competition checklist](docs/competition.md) · [Deployment plan](docs/deployment.md)
- [WAICY report draft](docs/waicy-report.en.md) · [Source register](docs/source-register.md)

Repository: [Sutdents-Project-Hub/CareKitchen](https://github.com/Sutdents-Project-Hub/CareKitchen). The public showcase platform and URL are not yet confirmed. Project workflow guidance is in [AGENTS.md](AGENTS.md).
