import type {
  ItemAmount,
  MealCard,
  MealContext,
  PriceQuote,
} from "../contracts.ts";
import { RECIPES } from "./recipes.ts";

const ALIASES: Record<string, string> = {
  leafygreens: "青菜",
  leafyvegetables: "青菜類",
  greens: "青菜",
  carrots: "紅蘿蔔",
  potatoes: "馬鈴薯",
  potato: "馬鈴薯",
  sweetpotato: "地瓜",
  sweetpotatoes: "地瓜",
  tomatoes: "番茄",
  cucumbers: "小黃瓜",
  whiterice: "白米",
  rice: "白米",
  cookedrice: "熟飯",
  mushroom: "菇類",
  mushrooms: "菇類",
  broccoli: "花椰菜",
  pumpkin: "南瓜",
  eggplant: "茄子",
  rolledoats: "燕麥",
  cookedchickpeas: "熟鷹嘴豆",
  plainyogurt: "原味優格",
  milk: "牛奶",
  meat: "肉",
  seafood: "海鮮",
  fish: "魚",
  dairy: "乳製品",
  peanuts: "花生",
  peanut: "花生",
  nuts: "堅果",
  sesame: "芝麻",
  gluten: "麩質",
  wheat: "小麥",
  legumes: "豆類",
  soyproducts: "豆製品",
  vegetables: "蔬菜",
  water: "水",
  drinkingwater: "飲用水",
  soybeans: "黃豆",
  蛋: "雞蛋",
  雞蛋: "雞蛋",
  eggs: "雞蛋",
  egg: "雞蛋",
  大豆: "黃豆",
  黃豆: "黃豆",
  soy: "黃豆",
  soybean: "黃豆",
  嫩豆腐: "豆腐",
  板豆腐: "豆腐",
  傳統豆腐: "豆腐",
  tofu: "豆腐",
  葉菜: "青菜",
  葉菜類: "青菜",
  綠葉菜: "青菜",
  包心菜: "高麗菜",
  cabbage: "高麗菜",
  胡蘿蔔: "紅蘿蔔",
  carrot: "紅蘿蔔",
  洋芋: "馬鈴薯",
  番薯: "地瓜",
  蕃薯: "地瓜",
  蕃茄: "番茄",
  tomato: "番茄",
  黃瓜: "小黃瓜",
  cucumber: "小黃瓜",
  米: "白米",
  生米: "白米",
  蘑菇: "菇類",
  香菇: "菇類",
  金針菇: "菇類",
  菇: "菇類",
  青花菜: "花椰菜",
  綠花椰菜: "花椰菜",
};
export function canonicalIngredient(name: string): string {
  const clean = name.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, "");
  return Object.hasOwn(ALIASES, clean) ? ALIASES[clean] : clean;
}
const KNOWN = new Set([
  ...RECIPES.flatMap((r) => r.ingredients.map((i) => i.name)),
  ...Object.values(ALIASES),
  "食用水",
  "飲用水",
  "水",
  "肉",
  "肉類",
  "海鮮",
  "魚",
  "奶",
  "牛奶",
  "乳製品",
  "花生",
  "堅果",
  "芝麻",
  "麩質",
  "小麥",
  "豆類",
  "豆製品",
  "蔬菜",
  "青菜類",
  "菇類",
]);
export function ingredientExcluded(name: string, excluded: string[]): boolean {
  const value = canonicalIngredient(name);
  return excluded.some((raw) => {
    const block = canonicalIngredient(raw);
    if (value === block) return true;
    if (["黃豆", "豆類", "豆製品"].includes(block))
      return ["豆腐", "黃豆"].includes(value);
    if (["蔬菜", "青菜類"].includes(block))
      return [
        "青菜",
        "高麗菜",
        "紅蘿蔔",
        "南瓜",
        "茄子",
        "花椰菜",
        "小黃瓜",
        "番茄",
      ].includes(value);
    return false;
  });
}
function validAmount(item: ItemAmount): boolean {
  return (
    item.quantity !== null &&
    Number.isFinite(item.quantity) &&
    item.quantity >= 0 &&
    item.unit !== null
  );
}
function purchaseCost(item: ItemAmount, quotes: PriceQuote[]): number | null {
  if (!validAmount(item)) return null;
  // Each quote represents a purchasable package: never prorate a package or convert units by guessing.
  const matching = quotes.filter(
    (q) =>
      canonicalIngredient(q.name) === canonicalIngredient(item.name) &&
      q.unit === item.unit &&
      Number.isFinite(q.quantity) &&
      q.quantity > 0 &&
      Number.isFinite(q.priceTwd) &&
      q.priceTwd >= 0,
  );
  if (!matching.length) return null;
  return Math.min(
    ...matching.map((q) => Math.ceil(item.quantity! / q.quantity) * q.priceTwd),
  );
}
export function assessMeals(context: MealContext) {
  const unavailable = { cards: [], minimumOverBudgetTwd: null };
  if (
    !context.servings ||
    !Number.isInteger(context.servings) ||
    context.servings < 1 ||
    !Number.isInteger(context.mealCount) ||
    context.mealCount < 1 ||
    context.uncertainty
  )
    return unavailable;
  // Unsupported restrictions cannot be safely interpreted as permission to use every recipe.
  if (
    context.excludedIngredients.some((x) => !KNOWN.has(canonicalIngredient(x)))
  )
    return unavailable;
  if (
    context.excludedIngredients.some((x) =>
      ["水", "食用水", "飲用水"].includes(canonicalIngredient(x)),
    )
  )
    return unavailable;
  const factor = context.servings * context.mealCount;
  const candidates: Array<{ card: MealCard; score: number }> = [];
  let minimumOverBudgetTwd: number | null = null;
  for (const recipe of RECIPES) {
    if (
      recipe.equipment !== "no_cook" &&
      !context.equipment.includes(recipe.equipment)
    )
      continue;
    if (
      context.equipment.length &&
      !context.equipment.includes(recipe.equipment)
    )
      continue;
    // Two portions per heated batch is an estimate, not a promise about the user's appliance.
    const minutes =
      recipe.equipment === "no_cook"
        ? recipe.minutes + 2 * (factor - 1)
        : recipe.minutes * Math.ceil(factor / 2);
    if (context.maxTimeMinutes !== null && minutes > context.maxTimeMinutes)
      continue;
    if (
      recipe.ingredients.some((i) =>
        ingredientExcluded(i.name, context.excludedIngredients),
      )
    )
      continue;
    const fromPantry: ItemAmount[] = [];
    const toBuy: MealCard["toBuy"] = [];
    const unknownPantry: string[] = [];
    for (const ingredient of recipe.ingredients) {
      const quantity = ingredient.quantity * factor;
      const matching = context.pantryItems.filter(
        (i) => canonicalIngredient(i.name) === ingredient.name,
      );
      const available = matching
        .filter((i) => i.unit === ingredient.unit && validAmount(i))
        .reduce((sum, i) => sum + i.quantity!, 0);
      const unknown = matching.some(
        (i) => !validAmount(i) || i.unit !== ingredient.unit,
      );
      const used = Math.min(quantity, available);
      if (used > 0) fromPantry.push({ ...ingredient, quantity: used });
      if (available >= quantity) continue;
      if (unknown) {
        unknownPantry.push(ingredient.name);
        fromPantry.push({
          name: ingredient.name,
          quantity: null,
          unit: ingredient.unit,
        });
        // Inventory is claimed but not measurable: do not invent an amount or a guaranteed purchase shortfall.
        continue;
      }
      const purchase = { ...ingredient, quantity: quantity - used };
      toBuy.push({
        ...purchase,
        priceTwd: purchaseCost(purchase, context.purchasePrices),
      });
    }
    if (context.onlyPantry && toBuy.length) continue;
    const knownCostTwd =
      Math.round(
        toBuy.reduce((sum, item) => sum + (item.priceTwd ?? 0), 0) * 100,
      ) / 100;
    const missingPrices = toBuy
      .filter((i) => i.priceTwd === null)
      .map((i) => i.name);
    const budgetStatus: MealCard["budgetStatus"] =
      context.budgetTwd === null
        ? "no_budget"
        : knownCostTwd > context.budgetTwd
          ? "over"
          : missingPrices.length || unknownPantry.length
            ? "unknown"
            : "within";
    if (budgetStatus === "over") {
      minimumOverBudgetTwd = Math.min(
        minimumOverBudgetTwd ?? Infinity,
        knownCostTwd,
      );
      continue;
    }
    const card: MealCard = {
      id: recipe.id,
      title: recipe.title,
      servings: context.servings,
      mealCount: context.mealCount,
      equipment: recipe.equipment,
      minutes,
      fromPantry,
      toBuy,
      knownCostTwd,
      budgetStatus,
      missingPrices,
      unknownPantry,
      steps: [...recipe.steps],
    };
    const matchedCount = recipe.ingredients.filter((i) =>
      context.pantryItems.some((p) => canonicalIngredient(p.name) === i.name),
    ).length;
    const preference = context.preferences.reduce(
      (score, p) => score + (recipe.title.includes(p) ? 1 : 0),
      0,
    );
    candidates.push({
      card,
      score:
        matchedCount * 100 +
        (budgetStatus === "within" ? 20 : 0) -
        toBuy.length * 10 +
        preference,
    });
  }
  const sorted = candidates.sort(
    (a, b) =>
      b.score - a.score ||
      a.card.knownCostTwd - b.card.knownCostTwd ||
      a.card.minutes - b.card.minutes ||
      a.card.id.localeCompare(b.card.id),
  );
  // Present distinct ingredient combinations before the same dish made with a different appliance.
  const seen = new Set<string>();
  const distinct: MealCard[] = [];
  const alternatives: MealCard[] = [];
  for (const { card } of sorted) {
    const recipe = RECIPES.find((r) => r.id === card.id)!;
    const signature = recipe.ingredients
      .map((i) => i.name)
      .sort()
      .join("|");
    if (seen.has(signature)) alternatives.push(card);
    else {
      seen.add(signature);
      distinct.push(card);
    }
  }
  return {
    cards: [...distinct, ...alternatives].slice(0, 12),
    minimumOverBudgetTwd,
  };
}

export function generateMeals(context: MealContext): MealCard[] {
  return assessMeals(context).cards;
}
