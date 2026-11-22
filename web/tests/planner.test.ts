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
  const result = inspectTurn("改兩人份，預算改80，只有電鍋，不要蛋也不能吃花生", options);
  assert.equal(result.context.servings, 2);
  assert.equal(result.context.budgetTwd, 80);
  assert.deepEqual(result.context.equipment, ["rice_cooker"]);
  assert.deepEqual(result.context.excludedIngredients, ["蛋", "花生"]);
  assert.deepEqual(result.context.pantryItems, options.pantryItems);
});

test("unknown inventory stays unknown while supplied units are preserved", () => {
  const result = inspectTurn("家裡有豆腐 150 公克和青菜，只有電鍋", emptyContext);
  assert.deepEqual(result.context.pantryItems, [
    { name: "豆腐", quantity: 150, unit: "g" },
    { name: "青菜", quantity: null, unit: null },
  ]);
});

test("postposed ingredient exclusions still remove previously eligible dishes", async () => {
  const reply = await planTurn(turnSchema.parse({
    persona: "elder", text: "不要蛋，豆腐也不要，推薦晚餐", context: options,
  }));
  assert.deepEqual(reply.context.excludedIngredients, ["蛋", "豆腐"]);
  assert.ok(reply.cards.every(({ fromPantry, toBuy }) => [...fromPantry, ...toBuy].every(({ name }) => name !== "豆腐")));
});

test("equipment negation includes the whole connected list", async () => {
  const context: MealContext = { ...options, equipment: ["rice_cooker", "microwave"] };
  for (const text of ["沒有電鍋和微波爐，推薦晚餐", "電鍋和微波爐都不能用"]) {
    const reply = await planTurn(turnSchema.parse({ persona: "caregiver", text, context }));
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
  const first = await planTurn(turnSchema.parse({ persona: "elder", text: "我好像有飲食限制", context: options }));
  const second = await planTurn(turnSchema.parse({ persona: "elder", text: "請推薦晚餐", context: first.context }));
  assert.equal(first.context.uncertainty, true);
  assert.equal(second.responseType, "ask_clarification");
  assert.deepEqual(second.cards, []);
});

test("missing servings and unsupported quantities request clarification", async () => {
  const first = await planTurn(turnSchema.parse({ persona: "elder", text: "推薦晚餐", context: emptyContext }));
  const second = await planTurn(turnSchema.parse({ persona: "elder", text: "改成 30 人份", context: options }));
  assert.match(first.message, /份量/);
  assert.match(first.message, /設備/);
  assert.match(second.message, /12 人/);
  assert.deepEqual(second.cards, []);
});

test("local screening does not send a medical or identifiable turn to the model", async () => {
  const rejectedCall: RankMeals = () => { throw new Error("should not call provider"); };
  const medical = await planTurn(turnSchema.parse({ persona: "caregiver", text: "可以停藥嗎？", context: options }), rejectedCall);
  const personal = await planTurn(turnSchema.parse({ persona: "family", text: "我的信箱 demo@example.com，幫我備餐", context: options }), rejectedCall);
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
      decision: { action: "keep", preferredIds: ["steam-egg-tofu", meals[2].id] },
      modelInfo: { model: "test-double", promptVersion: "test" },
    };
  };
  const reply = await planTurn(turnSchema.parse({ persona: "elder", text: "推薦晚餐", context }), rank);
  assert.ok(reply.cards.every((meal) => meal.id !== "steam-egg-tofu"));
  assert.equal(reply.cards.length, 2);
  assert.equal(reply.modelInfo?.model, "test-double");
});

test("local role guidance and swap use approved cards", async () => {
  const elder = await planTurn(turnSchema.parse({ persona: "elder", text: "推薦晚餐", context: options }));
  const family = await planTurn(turnSchema.parse({ persona: "family", text: "推薦晚餐", context: options }));
  const previousMealIds = elder.cards.map(({ id }) => id);
  const swapped = await planTurn(turnSchema.parse({ persona: "elder", text: "換一道", context: options, previousMealIds }));
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
    { ...options, purchasePrices: [{ name: "豆腐", quantity: 0, unit: "g", priceTwd: 10 }] },
  ]) {
    assert.equal(turnSchema.safeParse({ persona: "elder", text: "推薦晚餐", context }).success, false);
  }
});
