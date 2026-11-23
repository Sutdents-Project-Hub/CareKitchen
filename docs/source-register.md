# Source Register and Decision Provenance

This register separates the original project idea, competition guidance, research suggestions, and implementation decisions. Original attachments are local reference materials and are not automatically public or versioned.

## Authority by document

| Document | Scope |
|---|---|
| `project-overview.md` | Purpose, phase, and scope |
| `product-spec.md` | Personas, requirement IDs, observable acceptance, excluded capabilities |
| `architecture.md` | Current single-Web system and responsibility boundaries |
| `agent-design.md` | Agent role, state, price, and safety strategy |
| `prompts/system-draft.md` | Prompt draft; treat as untested unless evidence states otherwise |
| `api-and-data-contracts.md` | Current API contract and sharing/storage status |
| `ux-and-user-flows.md` | Interface flows and accessibility goals |
| `evaluation-and-iteration.md` | Evaluation method, baseline, cases, scoring |
| `competition.md`, `demo-script.md` | Submission requirements and demo evidence |
| `implementation-roadmap.md`, `handoff-for-codex-claude.md` | Implementation and handoff sequence |

## Confirmed versus unverified

- Original brief: target audiences, ingredient/budget/restriction-based meal conversation, simple explanations, shopping, and role differentiation.
- Competition guidance: track, scoring, submission, conversation evidence, timeline, and student contribution expectations. Recheck official sources before submission: [WAICY 2026](https://www.waicy.org/waicy-2026/), [official guidebook](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf), [rubrics](https://www.waicy.org/rubrics/).
- Implemented: Next.js, TypeScript, Node.js 24, pnpm, Zod, Node.js tests, and an OpenAI adapter. GPT-6 Luna synthetic-case runs are recorded. Hosting remains undecided.
- Unverified: deployment platform, public evaluator access, data retention policy, real-user acceptance, public environment cost, and successful competition submission.

## Evidence rules

Claims such as “30 cases completed,” “90% V3 pass rate,” “pharmacist validated,” “production ready,” or “nutritionally accurate” require traceable evidence. None should be asserted without it. Report student work and AI/tool assistance based on actual records.

## Design and implementation references

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), revision `6ec2bb5`, informed design-system and accessibility checks.
- [unslop](https://github.com/heydamir/unslop), revision `620163e`, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), informed layout review.
- Interface icons use [Lucide](https://lucide.dev/); the meal catalog is original to this project.
- Technical references include [OpenAI integration](integrations.md) and [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation).
- Self-hosted Latin variants of Source Serif 4 and IBM Plex Sans use the SIL Open Font License; license files are stored under `web/app/fonts/`.
- The English report references Taiwan's December 2025 population statistics for demographic context. This does not validate the meal-planning problem; that remains a user-needs hypothesis. [Ministry of the Interior analysis](https://www.moi.gov.tw/News_Content.aspx?n=2&s=335870).
