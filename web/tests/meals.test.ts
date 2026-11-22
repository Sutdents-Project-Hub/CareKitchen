import test from "node:test";
import assert from "node:assert/strict";
import { emptyContext, type MealContext } from "../lib/contracts.ts";
import {
  canonicalIngredient,
  generateMeals,
  ingredientExcluded,
} from "../lib/server/meals.ts";
import { RECIPES } from "../lib/server/recipes.ts";
const context = (patch: Partial<MealContext> = {}): MealContext => ({
  ...emptyContext,
  servings: 1,
  equipment: ["rice_cooker"],
  ...patch,
});
const card = (ctx: MealContext, id = "steam-tofu-greens") =>
  generateMeals(ctx).find((c) => c.id === id);

test("catalog has at least 18 complete original options", () => {
  assert.ok(RECIPES.length >= 18);
  assert.equal(new Set(RECIPES.map((r) => r.id)).size, RECIPES.length);
  for (const recipe of RECIPES) {
    assert.ok(recipe.ingredients.length > 0);
    assert.ok(recipe.steps.length >= 2 && recipe.steps.length <= 5);
    assert.ok(recipe.ingredients.every((i) => i.quantity > 0));
  }
});
test("no equipment never invents a heating method; no_cook only remains no_cook", () => {
  for (const equipment of [[], ["no_cook"]] as MealContext["equipment"][]) {
    const cards = generateMeals(context({ equipment }));
    assert.ok(cards.length > 0);
    assert.ok(cards.every((c) => c.equipment === "no_cook"));
  }
  assert.ok(
    generateMeals(context({ equipment: ["rice_cooker"] })).every(
      (c) => c.equipment === "rice_cooker",
    ),
  );
});
test("unknown prices never produce within budget", () => {
  const meal = card(context({ budgetTwd: 100 }));
  assert.ok(meal);
  assert.equal(meal.budgetStatus, "unknown");
  assert.deepEqual(meal.missingPrices, ["豆腐", "青菜"]);
  assert.equal(meal.knownCostTwd, 0);
});
test("packages round up, including multiple portions and meals", () => {
  const meal = card(
    context({
      servings: 2,
      mealCount: 3,
      budgetTwd: 500,
      purchasePrices: [
        { name: "豆腐", quantity: 300, unit: "g", priceTwd: 30 },
        { name: "青菜", quantity: 500, unit: "g", priceTwd: 40 },
      ],
    }),
  );
  assert.ok(meal);
  assert.equal(meal.toBuy.find((i) => i.name === "豆腐")?.quantity, 900);
  assert.equal(meal.toBuy.find((i) => i.name === "青菜")?.quantity, 720);
  assert.equal(meal.knownCostTwd, 170);
  assert.equal(meal.budgetStatus, "within");
});
test("known subtotal already over budget excludes meal even with another missing price", () => {
  assert.equal(
    card(
      context({
        budgetTwd: 20,
        purchasePrices: [
          { name: "豆腐", quantity: 300, unit: "g", priceTwd: 30 },
        ],
      }),
    ),
    undefined,
  );
});
test("incompatible units cannot be guessed and pantry quantities cannot be invented", () => {
  const meal = card(
    context({
      budgetTwd: 100,
      pantryItems: [
        { name: "豆腐", quantity: 1, unit: "個" },
        { name: "青菜", quantity: null, unit: null },
      ],
      purchasePrices: [{ name: "豆腐", quantity: 1, unit: "個", priceTwd: 20 }],
    }),
  );
  assert.ok(meal);
  assert.equal(meal.budgetStatus, "unknown");
  assert.deepEqual(meal.unknownPantry, ["豆腐", "青菜"]);
  assert.ok(meal.fromPantry.every((i) => i.quantity === null));
});
test("known stock is subtracted before package pricing; aliases match exact food names", () => {
  const meal = card(
    context({
      budgetTwd: 30,
      pantryItems: [
        { name: "板豆腐", quantity: 100, unit: "g" },
        { name: "青菜", quantity: 120, unit: "g" },
      ],
      purchasePrices: [
        { name: "豆腐", quantity: 100, unit: "g", priceTwd: 12 },
      ],
    }),
  );
  assert.ok(meal);
  assert.equal(meal.toBuy[0].quantity, 50);
  assert.equal(meal.knownCostTwd, 12);
  assert.equal(meal.budgetStatus, "within");
  assert.equal(canonicalIngredient(" egg "), "雞蛋");
});
test("egg exclusion avoids eggs without false positives in cabbage or eggplant", () => {
  const meals = generateMeals(context({ excludedIngredients: ["egg"] }));
  assert.ok(meals.length);
  assert.ok(
    meals.every((m) =>
      [...m.fromPantry, ...m.toBuy].every((i) => i.name !== "雞蛋"),
    ),
  );
  assert.equal(ingredientExcluded("茄子", ["egg"]), false);
  assert.equal(ingredientExcluded("高麗菜", ["蛋"]), false);
});
test("soy exclusion includes tofu; unsupported restrictions and uncertainty abstain", () => {
  assert.equal(ingredientExcluded("豆腐", ["大豆"]), true);
  assert.ok(
    generateMeals(context({ excludedIngredients: ["大豆"] })).every(
      (c) => !c.title.includes("豆腐"),
    ),
  );
  assert.deepEqual(
    generateMeals(context({ excludedIngredients: ["不明複合過敏原"] })),
    [],
  );
  assert.deepEqual(generateMeals(context({ uncertainty: true })), []);
});
test("only pantry excludes known purchases and respects time changes on each call", () => {
  const ctx = context({
    onlyPantry: true,
    pantryItems: [
      { name: "豆腐", quantity: 150, unit: "g" },
      { name: "青菜", quantity: 120, unit: "g" },
    ],
  });
  assert.ok(card(ctx));
  assert.ok(generateMeals(ctx).every((c) => c.toBuy.length === 0));
  assert.equal(card({ ...ctx, servings: 2 }), undefined);
  assert.equal(card({ ...ctx, maxTimeMinutes: 10 }), undefined);
});
test("known full inventory has no new purchase cost; no budget is distinct", () => {
  const ctx = context({
    pantryItems: [
      { name: "豆腐", quantity: 150, unit: "g" },
      { name: "青菜", quantity: 120, unit: "g" },
    ],
  });
  assert.equal(card(ctx)?.budgetStatus, "no_budget");
  assert.equal(card({ ...ctx, budgetTwd: 0 })?.budgetStatus, "within");
  assert.equal(card({ ...ctx, budgetTwd: 0 })?.knownCostTwd, 0);
});
