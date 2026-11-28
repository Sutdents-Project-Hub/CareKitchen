import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyContext, type MealContext } from "../lib/contracts.ts";
import { englishCard, ingredientEnglish } from "../lib/server/english.ts";
import { canonicalIngredient } from "../lib/server/meals.ts";
import { planTurn, type RankMeals } from "../lib/server/planner.ts";
import { RECIPES } from "../lib/server/recipes.ts";
import { turnSchema } from "../lib/server/turn.ts";

const context: MealContext = {
  ...emptyContext,
  servings: 1,
  equipment: ["rice_cooker"],
  pantryItems: [{ name: "豆腐", quantity: 300, unit: "g" }],
};
const englishTurn = (text: string, values: MealContext = context) =>
  turnSchema.parse({ persona: "elder", text, context: values, language: "en" });
const noChinese = (value: unknown) =>
  assert.doesNotMatch(JSON.stringify(value), /\p{Script=Han}/u);

test("the entire original catalog has English display text without altering recipe facts", () => {
  for (const recipe of RECIPES) {
    const original = {
      ...recipe,
      servings: 1,
      mealCount: 1,
      fromPantry: recipe.ingredients,
      toBuy: [],
      knownCostTwd: 0,
      budgetStatus: "no_budget" as const,
      missingPrices: recipe.ingredients.map(({ name }) => name),
      unknownPantry: [],
    };
    const card = englishCard(original);
    noChinese([
      card.title,
      card.steps,
      card.fromPantry.map(({ name }) => name),
      card.missingPrices,
    ]);
    assert.equal(card.steps.length, recipe.steps.length);
    assert.equal(card.id, recipe.id);
    assert.equal(card.equipment, recipe.equipment);
    assert.equal(card.minutes, recipe.minutes);
    assert.deepEqual(
      card.fromPantry.map(({ name, ...amount }) => ({
        name: canonicalIngredient(name),
        ...amount,
      })),
      recipe.ingredients,
    );
  }
});

test("English replies preserve Chinese recipe selection, costs and unknowns", async () => {
  const chinese = await planTurn(
    turnSchema.parse({ persona: "elder", text: "推薦晚餐", context }),
  );
  const english = await planTurn(englishTurn("Plan dinner."));
  assert.deepEqual(
    english.cards.map(({ id, knownCostTwd, budgetStatus }) => ({
      id,
      knownCostTwd,
      budgetStatus,
    })),
    chinese.cards.map(({ id, knownCostTwd, budgetStatus }) => ({
      id,
      knownCostTwd,
      budgetStatus,
    })),
  );
  noChinese([
    english.message,
    english.unknowns,
    english.cards.map(({ title, reason, steps }) => ({ title, reason, steps })),
  ]);
  assert.equal(english.context.pantryItems[0].name, "tofu");
  assert.ok(english.unknowns.some((value) => /prices to confirm/i.test(value)));
  assert.match(chinese.message, /道/);
});

test("English model ranking receives English facts and only selects eligible catalog IDs", async () => {
  const rank: RankMeals = async (turn, conditions, cards) => {
    assert.equal(turn.language, "en");
    assert.deepEqual(conditions.excludedIngredients, ["eggs"]);
    noChinese([cards, conditions.preferences, conditions.excludedIngredients]);
    assert.ok(cards.every(({ ingredients }) => !ingredients.includes("eggs")));
    return {
      decision: {
        action: "keep",
        preferredIds: ["steam-egg-tofu", cards[1].id],
      },
      modelInfo: { model: "fixture", promptVersion: "test" },
    };
  };
  const reply = await planTurn(
    englishTurn("Plan dinner.", { ...context, excludedIngredients: ["蛋"] }),
    rank,
  );
  assert.equal(reply.cards.length, 2);
  assert.ok(reply.cards.every(({ id }) => id !== "steam-egg-tofu"));
  assert.deepEqual(reply.context.excludedIngredients, ["eggs"]);
});

test("English context round trips preserve inventory, quotes and exclusions", async () => {
  const first = await planTurn(
    englishTurn("Plan dinner.", {
      ...context,
      excludedIngredients: ["豆製品", "菇類"],
      pantryItems: [{ name: "馬鈴薯", quantity: 400, unit: "g" }],
      purchasePrices: [
        { name: "白米", quantity: 500, unit: "g", priceTwd: 60 },
      ],
    }),
  );
  const second = await planTurn(englishTurn("Plan dinner.", first.context));
  assert.deepEqual(second.context, first.context);
  assert.ok(second.cards.length);
  assert.ok(
    second.cards.every(({ fromPantry, toBuy }) =>
      [...fromPantry, ...toBuy].every(
        ({ name }) => !["tofu", "mushrooms"].includes(name),
      ),
    ),
  );
  assert.equal(canonicalIngredient(ingredientEnglish("青菜類")), "青菜類");
});

test("English safety gates and model referrals never expose a meal card", async () => {
  const noProvider: RankMeals = () => {
    throw new Error("Local safety screening should block the provider");
  };
  for (const text of [
    "Can I stop my medication?",
    "I choke when eating. Plan dinner.",
  ]) {
    const reply = await planTurn(englishTurn(text), noProvider);
    assert.equal(reply.responseType, "professional_referral");
    assert.deepEqual(reply.cards, []);
    assert.match(reply.message, /professional/);
    noChinese(reply.message);
  }
  const rank: RankMeals = async () => ({
    decision: { action: "refer", preferredIds: [] },
    modelInfo: { model: "fixture", promptVersion: "test" },
  });
  const referral = await planTurn(englishTurn("Plan dinner."), rank);
  assert.equal(referral.responseType, "professional_referral");
  assert.deepEqual(referral.cards, []);
  noChinese(referral.message);
});

test("missing English equipment and servings are explained in English", async () => {
  const reply = await planTurn(englishTurn("Plan dinner.", emptyContext));
  assert.equal(reply.responseType, "ask_clarification");
  assert.deepEqual(reply.cards, []);
  assert.match(reply.message, /servings.*equipment/i);
  noChinese([reply.message, reply.unknowns]);
});

test("English grounded model questions keep hard conditions while ungrounded questions cannot block", async () => {
  const rank =
    (evidence: string): RankMeals =>
    async () => ({
      decision: {
        action: "clarify",
        preferredIds: [],
        clarification: { field: "servings", evidence },
      },
      modelInfo: { model: "fixture", promptVersion: "test" },
    });
  const question = await planTurn(
    englishTurn("More people, number undecided. Plan dinner."),
    rank("More people, number undecided"),
  );
  assert.equal(question.responseType, "ask_clarification");
  assert.match(question.message, /how many servings/i);
  assert.deepEqual(question.cards, []);
  assert.deepEqual(question.context.equipment, context.equipment);
  const ungrounded = await planTurn(
    englishTurn("Plan dinner."),
    rank("more people"),
  );
  assert.equal(ungrounded.responseType, "meal_candidates");
  assert.ok(ungrounded.cards.length);
});

test("English over-budget explanations preserve the calculated minimum and budget", async () => {
  const names = [
    "豆腐",
    "青菜",
    "南瓜",
    "菇類",
    "高麗菜",
    "紅蘿蔔",
    "地瓜",
    "白米",
    "馬鈴薯",
  ];
  const reply = await planTurn(
    englishTurn("Plan dinner.", {
      ...context,
      budgetTwd: 100,
      pantryItems: [],
      purchasePrices: [
        ...names.map((name) => ({
          name,
          unit: "g" as const,
          quantity: 500,
          priceTwd: 120,
        })),
        { name: "雞蛋", unit: "個", quantity: 6, priceTwd: 120 },
      ],
    }),
  );
  assert.deepEqual(reply.cards, []);
  assert.match(reply.message, /TWD 120.*TWD 100/);
  assert.match(reply.message, /adjust the budget/);
  noChinese(reply.message);
});

test("English display keeps multilingual safety and local clarification messages in English", async () => {
  const noProvider: RankMeals = () => {
    throw new Error(
      "Safety or clarification must resolve before model ranking",
    );
  };
  const medical = await planTurn(englishTurn("可以停藥嗎？"), noProvider);
  assert.equal(medical.responseType, "professional_referral");
  noChinese(medical.message);
  const unclear = await planTurn(
    englishTurn("我不確定有什麼飲食限制"),
    noProvider,
  );
  assert.equal(unclear.responseType, "ask_clarification");
  assert.deepEqual(unclear.cards, []);
  assert.match(unclear.message, /confirm.*excluded/i);
  noChinese(unclear.message);
});

test("pantry gaps are actionable and supported pantry matches take priority over model order", async () => {
  const stove: MealContext = { ...emptyContext, servings: 2, equipment: ["stove"] };
  const unsupported = await planTurn(englishTurn("I have chicken and white rice.", stove));
  assert.deepEqual(unsupported.cards, []);
  assert.match(unsupported.message, /chicken and white rice/);
  const alternate = await planTurn(englishTurn("Show dishes I can shop for.", unsupported.context));
  assert.ok(alternate.cards.length > 0);
  const rank: RankMeals = async () => ({
    decision: { action: "keep", preferredIds: ["boil-broccoli-carrot"] },
    modelInfo: { model: "fixture", promptVersion: "test" },
  });
  const supported = await planTurn(englishTurn("I have eggs and tomatoes.", stove), rank);
  assert.equal(supported.cards[0].id, "stove-egg-tomato");
  assert.deepEqual(supported.cards[0].unknownPantry, ["eggs", "tomatoes"]);
});

test("a casual swap and a why follow-up preserve hard conditions and reference displayed cards", async () => {
  const stove: MealContext = {
    ...emptyContext, servings: 2, equipment: ["stove"], excludedIngredients: ["eggs"], budgetTwd: 80,
  };
  const first = await planTurn(englishTurn("Dinner please.", stove));
  const previousMealIds = first.cards.map(({ id }) => id);
  const why = await planTurn({ ...englishTurn("Why did you choose these?", first.context), previousMealIds });
  assert.deepEqual(why.cards.map(({ id }) => id), previousMealIds);
  assert.ok(why.cards.every(({ title }) => why.message.includes(title)));
  assert.match(why.message, /prices still need confirmation/);
  const swap = await planTurn({ ...englishTurn("I want something different", why.context), previousMealIds });
  assert.ok(swap.cards.length > 0);
  assert.ok(swap.cards.every(({ id, servings }) => !previousMealIds.includes(id) && servings === 2));
  assert.deepEqual(swap.context.excludedIngredients, ["eggs"]);
  assert.equal(swap.context.budgetTwd, 80);
});
