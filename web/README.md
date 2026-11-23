# CareKitchen Web

The single Next.js App Router component contains the English-first and Traditional Chinese interfaces, `/api/chat`, the OpenAI adapter, the meal catalog, and price checks. It uses TypeScript, Node.js 24 LTS, pnpm 10, and Next.js 16. See `package.json` and `pnpm-lock.yaml` for pinned versions.

## Run and verify

Run these commands from `web/`. The local development URL is `http://localhost:3000`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

## AI modes

| Setting | Behavior |
|---|---|
| `CAREKITCHEN_CHAT_MODE=auto` (default) | Uses OpenAI when configured; otherwise uses clearly labeled local rules. |
| `CAREKITCHEN_CHAT_MODE=local` | Uses local rules only. |
| `CAREKITCHEN_CHAT_MODE=openai` | Requires a server-side API key; returns 503 when it is missing. |
| `OPENAI_API_KEY` | Server-side key in local `.env.local` or deployment secret settings. |
| `OPENAI_MODEL` | Optional model override; defaults to `gpt-6-luna`. Luna uses `reasoning.effort: "none"`. |

Upstream errors, timeouts, or unparseable responses prompt the user to retry. The interface labels local-rule results. See [OpenAI integration](../docs/integrations.md).

## Responsibilities and evidence

- `app/` and `components/` implement role selection, conversation, condition editing, meal cards, and shopping-summary preview.
- `lib/server/` parses conditions, filters candidates, and calculates shopping costs. OpenAI classifies intent and ranks existing eligible candidates; server-side rules remain authoritative.
- `tests/` use Node.js tests for rules and model substitutes. Actual local synthetic OpenAI runs, iteration records, and limitations are documented in [evaluation evidence](../docs/evidence/README.md). They do not establish public availability or real-user acceptance.
- Conversation state belongs to the current browser tab. Shopping summaries are manually copied. `/evidence/waicy` is a read-only page for recorded synthetic cases and includes English instructions; it is not a live chat. Public evaluator access remains unverified; see the [deployment plan](../docs/deployment.md).
