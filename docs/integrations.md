# OpenAI Integration

## Implementation

- `web/lib/server/openai.ts` uses the official Node SDK Responses API with Structured Outputs for intent and existing candidate IDs. The default model is `gpt-6-luna`; the English system prompt is `carekitchen-v5`. Luna requests set `reasoning.effort: "none"` to fit the structured response budget. Other models use their model-specific defaults when `OPENAI_MODEL` is changed.
- The model receives the current turn, role, servings, meals, equipment, budget, cooking-time limit, preferences, exclusions, and summaries of checked candidates. Local code handles package costs, original price quotes, full inventory, and conversation history. Responses API requests set `store: false`.
- Timeout is 12 seconds with no automatic retry. Each process allows at most 20 model requests per minute and three concurrent requests. Distributed quotas and public-demo account limits require deployment-time validation.
- Without a key, default mode uses local planning. With OpenAI enabled, upstream failures are reported with a retry option. Local code directly handles explicit medical questions and conditions that require clarification.
- Store real API keys only in server-side `.env.local` or deployment secrets. See [Web README](../web/README.md) for environment variables and modes.

## Recorded API checks

GPT-6 Luna has been used in local three-role flows, synthetic multi-turn cases, and version comparisons. A response's `modelInfo` indicates model output for that turn. Public availability, timeouts, quota, cost controls, and evaluator access have not been validated. See the [evaluation record](evidence/README.md).

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
