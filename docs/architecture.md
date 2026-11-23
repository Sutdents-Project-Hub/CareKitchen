# Architecture

## Implemented system

CareKitchen is a single Next.js App Router project under `web/`, using TypeScript, Node.js 24 LTS, and pnpm. The web application, server requests, meal planning, and tests share one dependency and deployment boundary.

```text
Browser: role, conditions, conversation, meals, shopping summary
  -> POST /api/chat: input, size, origin, and mode checks
  -> parse current user intent and explicit conditions
  -> recipe catalog: portions, equipment, exclusions, time, inventory, package costs
  -> OpenAI Structured Outputs (when enabled: classify intent and rank candidates)
  -> assemble answer and unresolved items from eligible candidates
```

| Path | Responsibility |
|---|---|
| `web/app/`, `web/components/` | Role entry, conversation, condition editor, meal cards, shopping preview and copy |
| `web/app/api/chat/route.ts` | Request boundary, configuration, model rate limits, error responses |
| `web/lib/server/turn.ts` | Zod validation, condition updates, medical-boundary and uncertainty handling |
| `web/lib/server/meals.ts`, `recipes.ts` | Original meal catalog, constraint checks, inventory deductions, cost calculations |
| `web/lib/server/planner.ts`, `openai.ts` | Response composition and OpenAI adapter; ranking may select only existing eligible IDs |
| `web/tests/` | Local rule and model-substitute regression tests |

Each turn carries forward prior conditions and applies recognizable changes from the current turn. Users can edit conditions that were not recognized and remove exclusions. The server recalculates costs and restrictions; the browser displays the returned result. Reloading the page clears the current session.

## Language and price behavior

The interface is English-first and retains Traditional Chinese. The API's optional `language: "en"` selects English output; omission preserves the legacy Chinese caller behavior. Budget checks cover additional purchase spending from user-provided package prices. Missing price or quantity information remains unknown. English wording does not change price calculations or safety checks.

## Deployment and data

Public hosting, persistent conversations, and snapshot sharing are undecided. Confirm storage, access control, expiration, withdrawal, and backups before implementing public sharing. See [data and storage](data-and-storage.md), [deployment plan](deployment.md), and [OpenAI integration](integrations.md).

## Competition evidence page

`/evidence/waicy` is a read-only page compiled with the web app from fixed synthetic cases. It shows recorded turns and model participation. Interactive conversation state remains in the current browser tab. See [evaluation evidence](evidence/README.md).
