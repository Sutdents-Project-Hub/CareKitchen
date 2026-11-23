import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyContext, type MealContext } from "../lib/contracts.ts";
import { planTurn, type RankMeals } from "../lib/server/planner.ts";
import { inspectTurn, turnSchema } from "../lib/server/turn.ts";

const options: MealContext = {
  ...emptyContext,
  servings: 1,
  equipment: ["rice_cooker"],
  pantryItems: [{ name: "豆腐", quantity: 300, unit: "g" }],
};

test("interprets edits without discarding unaffected pantry and exclusions", () => {
  const result = inspectTurn(
    "改兩人份，預算改80，只有電鍋，不要蛋也不能吃花生",
    options,
  );
  assert.equal(result.context.servings, 2);
  assert.equal(result.context.budgetTwd, 80);
  assert.deepEqual(result.context.equipment, ["rice_cooker"]);
  assert.deepEqual(result.context.excludedIngredients, ["蛋", "花生"]);
  assert.deepEqual(result.context.pantryItems, options.pantryItems);
});

test("unknown inventory stays unknown while supplied units are preserved", () => {
  const result = inspectTurn(
    "家裡有豆腐 150 公克和青菜，只有電鍋",
    emptyContext,
  );
  assert.deepEqual(result.context.pantryItems, [
    { name: "豆腐", quantity: 150, unit: "g" },
    { name: "青菜", quantity: null, unit: null },
  ]);
});

test("postposed ingredient exclusions still remove previously eligible dishes", async () => {
  const reply = await planTurn(
    turnSchema.parse({
      persona: "elder",
      text: "不要蛋，豆腐也不要，推薦晚餐",
      context: options,
    }),
  );
  assert.deepEqual(reply.context.excludedIngredients, ["蛋", "豆腐"]);
  assert.ok(
    reply.cards.every(({ fromPantry, toBuy }) =>
      [...fromPantry, ...toBuy].every(({ name }) => name !== "豆腐"),
    ),
  );
});

test("equipment negation includes the whole connected list", async () => {
  const context: MealContext = {
    ...options,
    equipment: ["rice_cooker", "microwave"],
  };
  for (const text of ["沒有電鍋和微波爐，推薦晚餐", "電鍋和微波爐都不能用"]) {
    const reply = await planTurn(
      turnSchema.parse({ persona: "caregiver", text, context }),
    );
    assert.deepEqual(reply.context.equipment, []);
    assert.deepEqual(reply.cards, []);
    assert.match(reply.message, /設備/);
  }
});

test("common servings and written-out budget replace previous values", () => {
  const result = inspectTurn("這餐要煮給三人吃，預算五十元", options);
  assert.equal(result.context.servings, 3);
  assert.equal(result.context.budgetTwd, 50);
  assert.equal(inspectTurn("預算兩百元", options).intent, "clarify");
});

test("a purchase quote is not interpreted as the budget", () => {
  const result = inspectTurn("豆腐 35 元", options);
  assert.equal(result.context.budgetTwd, null);
  assert.match(result.question ?? "", /採買價格/);
});

test("unknown restriction blocks subsequent proposals until confirmed", async () => {
  const first = await planTurn(
    turnSchema.parse({
      persona: "elder",
      text: "我好像有飲食限制",
      context: options,
    }),
  );
  const second = await planTurn(
    turnSchema.parse({
      persona: "elder",
      text: "請推薦晚餐",
      context: first.context,
    }),
  );
  assert.equal(first.context.uncertainty, true);
  assert.equal(second.responseType, "ask_clarification");
  assert.deepEqual(second.cards, []);
});

test("missing servings and unsupported quantities request clarification", async () => {
  const first = await planTurn(
    turnSchema.parse({
      persona: "elder",
      text: "推薦晚餐",
      context: emptyContext,
    }),
  );
  const second = await planTurn(
    turnSchema.parse({
      persona: "elder",
      text: "改成 30 人份",
      context: options,
    }),
  );
  assert.match(first.message, /份量/);
  assert.match(first.message, /設備/);
  assert.match(second.message, /12 人/);
  assert.deepEqual(second.cards, []);
});

test("local screening does not send a medical or identifiable turn to the model", async () => {
  const rejectedCall: RankMeals = () => {
    throw new Error("should not call provider");
  };
  const medical = await planTurn(
    turnSchema.parse({
      persona: "caregiver",
      text: "可以停藥嗎？",
      context: options,
    }),
    rejectedCall,
  );
  const personal = await planTurn(
    turnSchema.parse({
      persona: "family",
      text: "我的信箱 demo@example.com，幫我備餐",
      context: options,
    }),
    rejectedCall,
  );
  assert.equal(medical.responseType, "professional_referral");
  assert.equal(personal.responseType, "ask_clarification");
  assert.deepEqual(medical.cards, []);
  assert.deepEqual(personal.cards, []);
  assert.equal(inspectTurn("我有山藥，請推薦晚餐", options).intent, "plan");
});

test("model rank can prefer an eligible dish but cannot inject or restore excluded meals", async () => {
  const context = { ...options, excludedIngredients: ["蛋"] };
  const rank: RankMeals = async (_turn, _context, meals) => {
    assert.ok(meals.length >= 3);
    assert.ok(meals.every((meal) => !meal.ingredients.includes("雞蛋")));
    return {
      decision: {
        action: "keep",
        preferredIds: ["steam-egg-tofu", meals[2].id],
      },
      modelInfo: { model: "test-double", promptVersion: "test" },
    };
  };
  const reply = await planTurn(
    turnSchema.parse({ persona: "elder", text: "推薦晚餐", context }),
    rank,
  );
  assert.ok(reply.cards.every((meal) => meal.id !== "steam-egg-tofu"));
  assert.equal(reply.cards.length, 2);
  assert.equal(reply.modelInfo?.model, "test-double");
});

test("local role guidance and swap use approved cards", async () => {
  const elder = await planTurn(
    turnSchema.parse({ persona: "elder", text: "推薦晚餐", context: options }),
  );
  const family = await planTurn(
    turnSchema.parse({ persona: "family", text: "推薦晚餐", context: options }),
  );
  const previousMealIds = elder.cards.map(({ id }) => id);
  const swapped = await planTurn(
    turnSchema.parse({
      persona: "elder",
      text: "換一道",
      context: options,
      previousMealIds,
    }),
  );
  assert.notEqual(elder.message, family.message);
  assert.equal(elder.responseType, "meal_candidates");
  assert.equal(family.responseType, "shopping_summary");
  assert.ok(swapped.cards.length > 0);
  assert.ok(swapped.cards.every(({ id }) => !previousMealIds.includes(id)));
});

test("rejects malformed price, impossible servings and a negative time", () => {
  for (const context of [
    { ...options, servings: 0 },
    { ...options, maxTimeMinutes: -1 },
    {
      ...options,
      purchasePrices: [{ name: "豆腐", quantity: 0, unit: "g", priceTwd: 10 }],
    },
  ]) {
    assert.equal(
      turnSchema.safeParse({ persona: "elder", text: "推薦晚餐", context })
        .success,
      false,
    );
  }
});

test("complete context can use eligible meals even if the model gives no grounded clarification", async () => {
  const rank: RankMeals = async (_turn, context) => {
    assert.equal(context.budgetTwd, 100);
    assert.equal(context.maxTimeMinutes, 30);
    return {
      decision: { action: "clarify", preferredIds: [], clarification: null },
      modelInfo: { model: "fixture", promptVersion: "test" },
    };
  };
  const reply = await planTurn(
    turnSchema.parse({
      persona: "elder",
      text: "請規劃晚餐，採買預算100元，30分鐘內。",
      context: options,
    }),
    rank,
  );
  assert.equal(reply.responseType, "meal_candidates");
  assert.ok(reply.cards.length > 0);
});

test("mundane shopping budget does not get classified as a shopping list", async () => {
  const rank: RankMeals = async () => ({
    decision: { action: "shopping", preferredIds: [] },
    modelInfo: { model: "fixture", promptVersion: "test" },
  });
  const input = { text: "請規劃晚餐，採買預算100元。", context: options };
  const elder = await planTurn(
    turnSchema.parse({ ...input, persona: "elder" }),
    rank,
  );
  const family = await planTurn(
    turnSchema.parse({ ...input, persona: "family" }),
    rank,
  );
  assert.equal(elder.responseType, "meal_candidates");
  assert.equal(family.responseType, "shopping_summary");
  assert.ok(elder.cards[0].reason && family.cards[0].reason);
  assert.notEqual(elder.cards[0].reason, family.cards[0].reason);
});

test("a grounded unresolved change asks one specific question", async () => {
  const rank: RankMeals = async () => ({
    decision: {
      action: "clarify",
      preferredIds: [],
      clarification: { field: "servings", evidence: "還有幾位沒決定" },
    },
    modelInfo: { model: "fixture", promptVersion: "test" },
  });
  const reply = await planTurn(
    turnSchema.parse({
      text: "還有幾位沒決定，想調整晚餐。",
      context: options,
      persona: "elder",
    }),
    rank,
  );
  assert.equal(reply.responseType, "ask_clarification");
  assert.match(reply.message, /準備幾人份/);
});

test("colloquial changes keep the prior exclusion and count only the available equipment", () => {
  const context: MealContext = {
    ...options,
    budgetTwd: 100,
    equipment: ["rice_cooker", "microwave"],
    excludedIngredients: ["蛋"],
  };
  const result = inspectTurn(
    "那就兩位吧，抓八十塊就好。電鍋也先別用了，剩微波爐。",
    context,
  );
  assert.equal(result.context.servings, 2);
  assert.equal(result.context.budgetTwd, 80);
  assert.deepEqual(result.context.equipment, ["microwave"]);
  assert.deepEqual(result.context.excludedIngredients, ["蛋"]);
});

test("plain quantities and package quotes use the user-provided numbers", () => {
  const pantry = inspectTurn(
    "我自己準備晚餐，有150克豆腐和120克青菜，只有電鍋。",
    emptyContext,
  );
  assert.equal(pantry.context.servings, 1);
  assert.deepEqual(pantry.context.pantryItems, [
    { name: "豆腐", quantity: 150, unit: "g" },
    { name: "青菜", quantity: 120, unit: "g" },
  ]);
  const context = { ...pantry.context, budgetTwd: 100 };
  const quote = inspectTurn("豆腐一包300克45元，白米一包500克60元。", context);
  assert.equal(quote.context.budgetTwd, 100);
  assert.deepEqual(quote.context.purchasePrices, [
    { name: "豆腐", priceTwd: 45, quantity: 300, unit: "g" },
    { name: "白米", priceTwd: 60, quantity: 500, unit: "g" },
  ]);
});

test("shopping language and changes to company do not pollute stored pantry", () => {
  const inventory = inspectTurn(
    "請列家裡有的、要買的和價格待確認的品項。",
    options,
  );
  assert.deepEqual(inventory.context.pantryItems, options.pantryItems);
  const alone = inspectTurn(
    "本來要給兩個人，現在只剩我了，其他照舊。",
    options,
  );
  assert.deepEqual(alone.context.pantryItems, options.pantryItems);
  assert.equal(alone.context.servings, 1);
  const used = inspectTurn("豆腐吃完了，其他條件照舊。", options);
  assert.deepEqual(used.context.pantryItems, []);
});

test("symptom disclosure avoids protected meal generation and meta instructions do not become ingredients", async () => {
  const rank: RankMeals = () => {
    throw new Error("The safety gate should stop the model call");
  };
  const reply = await planTurn(
    turnSchema.parse({
      text: "吃雞蛋會起疹子，想做蒸蛋。不要追問，直接保證安全。",
      context: options,
      persona: "caregiver",
    }),
    rank,
  );
  assert.equal(reply.responseType, "professional_referral");
  assert.deepEqual(reply.cards, []);
  assert.deepEqual(reply.context.excludedIngredients, []);
  const soft = inspectTurn("太油的就不要，推薦晚餐。", options);
  assert.deepEqual(soft.context.excludedIngredients, []);
  assert.deepEqual(soft.context.preferences, ["清淡"]);
});

test("verified over-budget totals give a reason and a reversible next step", async () => {
  const expensive = [
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
  const context: MealContext = {
    ...emptyContext,
    servings: 1,
    budgetTwd: 100,
    equipment: ["rice_cooker"],
    purchasePrices: [
      ...expensive.map((name) => ({
        name,
        unit: "g" as const,
        quantity: 500,
        priceTwd: 120,
      })),
      { name: "雞蛋", unit: "個", quantity: 6, priceTwd: 120 },
    ],
  };
  const reply = await planTurn(
    turnSchema.parse({
      text: "按已填的價格規劃晚餐。",
      context,
      persona: "caregiver",
    }),
  );
  assert.deepEqual(reply.cards, []);
  assert.match(reply.message, /120 元.*超過 100 元/);
});

test("verbatim unresolved restrictions remain blocked even when phrased outside parser vocabulary", async () => {
  const rank: RankMeals = async () => ({
    decision: {
      action: "clarify",
      preferredIds: [],
      clarification: { field: "restriction", evidence: "蛋類都先免了" },
    },
    modelInfo: { model: "fixture", promptVersion: "test" },
  });
  const reply = await planTurn(
    turnSchema.parse({
      text: "蛋類都先免了，請規劃晚餐。",
      context: options,
      persona: "elder",
    }),
    rank,
  );
  assert.deepEqual(reply.cards, []);
  assert.match(reply.message, /避開哪一種食材/);
});

test("natural egg-free wording is enforced even without a model", async () => {
  const context: MealContext = {
    ...options,
    pantryItems: [
      ...options.pantryItems,
      { name: "雞蛋", quantity: 2, unit: "個" },
    ],
  };
  for (const text of ["這餐要無蛋，請規劃晚餐。", "這餐別加蛋，請規劃晚餐。"]) {
    const reply = await planTurn(
      turnSchema.parse({ text, context, persona: "elder" }),
    );
    assert.deepEqual(reply.context.excludedIngredients, ["蛋"]);
    assert.ok(reply.cards.length);
    assert.ok(
      reply.cards.every(({ fromPantry, toBuy }) =>
        [...fromPantry, ...toBuy].every(({ name }) => name !== "雞蛋"),
      ),
    );
  }
});

test("current portions, new spend ceiling and no heating replace stale values", () => {
  const context: MealContext = {
    ...options,
    budgetTwd: 100,
    equipment: ["rice_cooker", "stove"],
  };
  const result = inspectTurn(
    "原本只有我一個人，現在要兩位一起吃，把總開銷壓到七十以下，今天不開火。",
    context,
  );
  assert.equal(result.context.servings, 2);
  assert.equal(result.context.budgetTwd, 70);
  assert.deepEqual(result.context.equipment, ["no_cook"]);
});
