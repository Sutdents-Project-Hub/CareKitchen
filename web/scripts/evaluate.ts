// Synthetic cases only. Run from web/ under the Node.js react-server condition.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import OpenAI from "openai";
import {
  emptyContext,
  type ChatReply,
  type MealContext,
  type Persona,
} from "../lib/contracts.ts";
import { getInstructions, rankWithOpenAI } from "../lib/server/openai.ts";
import { canonicalIngredient } from "../lib/server/meals.ts";
import { planTurn } from "../lib/server/planner.ts";
import { turnSchema } from "../lib/server/turn.ts";

type Expectations = {
  servings?: number;
  budgetTwd?: number;
  equipment?: string[];
  excluded?: string[];
  quoteNames?: string[];
  minCards?: number;
  maxCards?: number;
  disallowedIngredient?: string;
  disallowedExclusion?: string;
  responseType?: ChatReply["responseType"];
  messageIncludes?: string;
  priceUncertainty?: boolean;
  knownSubtotalTwd?: number;
};
type Scenario = {
  id: string;
  persona: Persona;
  context?: Partial<MealContext>;
  turns: {
    text: string;
    formUpdate?: Partial<MealContext>;
    expect: Expectations;
  }[];
};

const [mode, label, output, fixtureFile] = process.argv.slice(2);
assert.ok(
  (mode === "app" || mode === "baseline") && label && output,
  "Usage: node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts <app|baseline> <label> <output>",
);
assert.ok(
  process.env.OPENAI_API_KEY?.trim(),
  "OpenAI key configuration is required.",
);
const model = process.env.OPENAI_MODEL?.trim() || "gpt-6-luna";
const fixture = JSON.parse(
  await readFile(
    fixtureFile ??
      new URL("../../docs/evidence/cases/meal-dialogues.json", import.meta.url),
    "utf8",
  ),
);
const scenarios: Scenario[] = [
  ...(fixture.samePrompt?.personas ?? []).map((persona: Persona) => ({
    id: `SAME-${persona.toUpperCase()}`,
    persona,
    turns: [
      { text: fixture.samePrompt.text, expect: fixture.samePrompt.expect },
    ],
  })),
  ...fixture.scenarios,
];
const language = fixture.language === "en" ? "en" : undefined;
const baselinePrompt =
  language === "en" ? "Answer the user in English." : "請以繁體中文回答使用者。";
const adapter = await readFile(
  new URL("../lib/server/openai.ts", import.meta.url),
  "utf8",
);
const prompt =
  mode === "baseline"
    ? baselinePrompt
    : getInstructions(language);
assert.ok(prompt, "Prompt text could not be identified");
const results: unknown[] = [];
const client =
  mode === "baseline"
    ? new OpenAI({
        maxRetries: 0,
        timeout: 20_000,
        baseURL: "https://api.openai.com/v1",
      })
    : undefined;
const errors: string[] = [];
const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

function check(reply: ChatReply, expected: Expectations) {
  const { context, cards } = reply;
  const actual: Record<string, boolean> = {};
  if (expected.servings !== undefined)
    actual.servings = context.servings === expected.servings;
  if (expected.budgetTwd !== undefined)
    actual.budgetTwd = context.budgetTwd === expected.budgetTwd;
  if (expected.equipment)
    actual.equipment =
      JSON.stringify(context.equipment) === JSON.stringify(expected.equipment);
  if (expected.excluded)
    actual.excluded = expected.excluded.every((item) =>
      context.excludedIngredients.some((entry) =>
        canonicalIngredient(entry) === canonicalIngredient(item),
      ),
    );
  if (expected.quoteNames)
    actual.quoteNames = expected.quoteNames.every((item) =>
      context.purchasePrices.some(({ name }) =>
        canonicalIngredient(name) === canonicalIngredient(item)),
    );
  if (expected.responseType)
    actual.responseType = reply.responseType === expected.responseType;
  if (expected.minCards !== undefined)
    actual.minCards = cards.length >= expected.minCards;
  if (expected.maxCards !== undefined)
    actual.maxCards = cards.length <= expected.maxCards;
  if (expected.disallowedIngredient)
    actual.disallowedIngredient = cards.every(
      (card) =>
        ![...card.fromPantry, ...card.toBuy].some(
          ({ name }) => canonicalIngredient(name) === canonicalIngredient(expected.disallowedIngredient!),
        ),
    );
  if (expected.disallowedExclusion)
    actual.disallowedExclusion = !context.excludedIngredients.includes(
      expected.disallowedExclusion,
    );
  if (expected.messageIncludes)
    actual.messageIncludes = reply.message.includes(expected.messageIncludes);
  if (expected.priceUncertainty)
    actual.priceUncertainty =
      cards.length > 0 &&
      cards.some((card) => card.missingPrices.length > 0) &&
      cards.every(
        (card) =>
          card.missingPrices.length === 0 || card.budgetStatus !== "within",
      );
  if (expected.knownSubtotalTwd !== undefined)
    actual.knownSubtotalTwd = cards.some(
      (card) => card.knownCostTwd === expected.knownSubtotalTwd,
    );
  return actual;
}

for (const scenario of scenarios) {
  let context = { ...emptyContext, ...scenario.context };
  let previousMealIds: string[] = [];
  const history: { role: "user" | "assistant"; content: string }[] = [];
  for (const [index, turn] of scenario.turns.entries()) {
    context = { ...context, ...turn.formUpdate };
    const caseId = `${scenario.id}-${index + 1}`;
    const timestamp = new Date().toISOString();
    const start = performance.now();
    try {
      if (client) {
        const setup = Array.isArray(scenario.context?.equipment)
          ? language === "en"
            ? `Here are my saved meal conditions and my quoted prices: ${JSON.stringify(scenario.context)}.\n`
            : `（以下是我已填的餐點條件，數字均為我提供的資料：${JSON.stringify(scenario.context)}。）\n`
          : "";
        const form = turn.formUpdate
          ? language === "en"
            ? "I confirmed the previously uncertain dietary restriction in the form.\n"
            : "（我已將未確認的限制改成已確認。）\n"
          : "";
        history.push({
          role: "user",
          content: `${index === 0 ? setup : ""}${form}${turn.text}`,
        });
        const response = await client.responses.create({
          model,
          instructions: baselinePrompt,
          input: history,
          store: false,
          ...(model === "gpt-6-luna"
            ? { reasoning: { effort: "none" as const } }
            : {}),
          max_output_tokens: 650,
        });
        const text = response.output_text;
        history.push({ role: "assistant", content: text });
        results.push({
          caseId,
          persona: scenario.persona,
          timestamp,
          input: history.at(-2)?.content,
          latencyMs: Math.round(performance.now() - start),
          model: response.model,
          status: response.status,
          output: text,
          usage: response.usage,
        });
      } else {
        const modelDecisions: Awaited<ReturnType<typeof rankWithOpenAI>>[] = [];
        const reply = await planTurn(
          turnSchema.parse({
            persona: scenario.persona,
            language,
            text: turn.text,
            context,
            previousMealIds,
          }),
          async (...args) => {
            const result = await rankWithOpenAI(...args);
            modelDecisions.push(result);
            return result;
          },
        );
        const checks = check(reply, turn.expect);
        results.push({
          caseId,
          persona: scenario.persona,
          timestamp,
          input: turn.text,
          formUpdate: turn.formUpdate,
          latencyMs: Math.round(performance.now() - start),
          modelDecisions,
          reply,
          checks,
        });
        context = reply.context;
        previousMealIds = reply.cards.map(({ id }) => id);
      }
    } catch (error) {
      const safeName = error instanceof Error ? error.name : "UnknownError";
      errors.push(`${caseId} ${safeName}`);
      results.push({
        caseId,
        persona: scenario.persona,
        timestamp,
        input: turn.text,
        latencyMs: Math.round(performance.now() - start),
        error: safeName,
      });
    }
  }
}
const revision = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
  encoding: "utf8",
}).trim();
await writeFile(
  output,
  JSON.stringify(
    {
      label,
      mode,
      model,
      language,
      fixtureVersion: fixture.fixtureVersion,
      sourceHead: revision,
      promptSha256: sha256(prompt),
      adapterSha256: mode === "app" ? sha256(adapter) : undefined,
      reasoning: model === "gpt-6-luna" ? "none" : "model-default",
      recordedResponses: results.length,
      errors,
      results,
    },
    null,
    2,
  ) + "\n",
  { flag: "wx" },
);
console.log(
  `${label}: ${results.length} synthetic turns, ${errors.length} execution errors`,
);
if (errors.length) process.exitCode = 1;
