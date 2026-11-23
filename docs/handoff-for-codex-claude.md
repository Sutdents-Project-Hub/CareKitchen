# CareKitchen Implementation Handoff

> The local Next.js prototype can be run as described in [`web/README.md`](../web/README.md). Local OpenAI runs are recorded; public deployment and external evaluator access are unverified. This handoff summarizes current boundaries and does not grant authorization for external actions.

## Project purpose and scope

- Repository: `CareKitchen`; project slug: `carekitchen`.
- Competition: WAICY 2026, Track 4 LLM & AI Agent (AI as a Service).
- Product: help older adults, caregivers, and family members discuss meals using ingredients, budget, equipment, preferences, and restrictions the user confirms.
- Original source attachments under local `docs/inputs-private/` are intentionally Git-ignored; do not publish them just because they exist. Use the public project specifications for implementation.

## Read before changing behavior

1. `AGENTS.md` for repository workflow, security, authorization, and documentation rules.
2. `README.md` for current status and entry points.
3. `docs/project-overview.md` and `docs/product-spec.md` for scope and acceptance criteria.
4. `docs/architecture.md` and `docs/api-and-data-contracts.md` for system/API responsibilities.
5. `docs/agent-design.md` and `docs/prompts/system-draft.md` for agent boundaries.
6. `docs/ux-and-user-flows.md` for the three roles and accessible interaction.
7. `docs/evaluation-and-iteration.md`, `docs/competition.md`, and `docs/demo-script.md` for evidence and submission.
8. `docs/security-and-privacy.md`, `docs/data-and-storage.md`, `docs/integrations.md`, and `docs/deployment.md` for higher-risk work and external services.

## Architecture and exclusions

- `web/` is the framework root and the only executable component. Keep the Next.js App Router manifest and lockfile directly inside it.
- The selected implementation uses Next.js, TypeScript, Node.js 24 LTS, and pnpm. Check actual package versions before editing documentation.
- Do not add `backend/`, `app/`, `cms/`, `worker/`, `packages/`, `database/`, Docker Compose, or Coolify resources without an evidenced need and an approved architecture decision.
- Use Next.js Route Handlers for server-side AI calls and deterministic constraint validation. Never expose provider keys to the browser; never trust the model for cost calculations or hard-constraint validation.
- Do not add accounts, health profiles, medical advice, live prices, image OCR, voice, or weekly menus to the current scope.
- Preserve deterministic price and restriction checks even if the model provider changes.

## Task workflow

1. Inspect `git status --short --branch`, `git branch --show-current`, and `git remote -v` before Git operations.
2. Inspect and preserve existing user/worktree changes and untracked project documentation.
3. State which CK/AC this task addresses, files affected, observable acceptance, and failure handling.
4. Make the smallest scoped change; verify relevant behavior and preserve reproducible failures.
5. Update authoritative README/docs when behavior, API, prompt, model/platform, storage, or deployment changes.
6. Without explicit user instruction, do not commit, push, create a remote, deploy externally, or enter a real key.
7. Do not overwrite original prompts or failed test data; preserve version, date, model, inputs, raw outputs, and scores.
8. Report actual checks/results, unverified items, data/security risks, and next work.

The initial setup request is historical. It asked for a runnable Next.js TypeScript App Router skeleton under `web/`, role/chat UI, and real verification of available quality commands, without claiming AI success before authorized provider configuration. It did not authorize paid API usage, a database, or cloud deployment. Later implementation must follow the current scope and authorization rather than treating the historical setup request as current permission.

## Handoff report

- **Completed:** task/CK/AC and changed paths.
- **Verification:** exact commands, counts, outcomes, and relevant output.
- **Documentation:** authoritative files updated.
- **Git:** branch, commit only if authorized, remote/push status.
- **Risks:** medical boundary, price uncertainty, personal data, quota, deployment unknowns, model limitations.
- **Next:** smallest independently verifiable task.

## Student contribution disclosure

Keep accurate records of student, advisor, Codex, and Claude contributions to code, prompts, tests, scoring, and writing. AI assistance is not itself competition evidence. The student should be able to explain design decisions, observed failures, verification, and changes.
