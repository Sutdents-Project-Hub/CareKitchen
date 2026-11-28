import type { MealCard, MealContext } from "../contracts.ts";
import { canonicalIngredient } from "./meals.ts";

// Display translations of the original catalog only; recipe facts and amounts stay unchanged.
const ingredientNames: Record<string, string> = {
  雞蛋: "eggs",
  黃豆: "soybeans",
  豆腐: "tofu",
  青菜: "leafy greens",
  高麗菜: "cabbage",
  紅蘿蔔: "carrots",
  馬鈴薯: "potatoes",
  地瓜: "sweet potatoes",
  番茄: "tomatoes",
  小黃瓜: "cucumber",
  白米: "white rice",
  熟飯: "cooked rice",
  菇類: "mushrooms",
  花椰菜: "broccoli",
  南瓜: "pumpkin",
  茄子: "eggplant",
  水: "water",
  食用水: "drinking water",
  飲用水: "drinking water",
  肉: "meat",
  肉類: "meat",
  海鮮: "seafood",
  魚: "fish",
  奶: "milk",
  牛奶: "milk",
  乳製品: "dairy",
  花生: "peanuts",
  堅果: "nuts",
  芝麻: "sesame",
  麩質: "gluten",
  小麥: "wheat",
  豆類: "legumes",
  豆製品: "soy products",
  蔬菜: "vegetables",
  青菜類: "leafy vegetables",
};
const preferenceNames: Record<string, string> = {
  清淡: "light",
  軟一點: "softer",
  簡單: "simple",
  快速: "quick",
  不辣: "not spicy",
};
export function ingredientEnglish(name: string): string {
  return ingredientNames[canonicalIngredient(name)] ?? name;
}
export function englishContext(context: MealContext): MealContext {
  return {
    ...context,
    pantryItems: context.pantryItems.map((item) => ({
      ...item,
      name: ingredientEnglish(item.name),
    })),
    purchasePrices: context.purchasePrices.map((item) => ({
      ...item,
      name: ingredientEnglish(item.name),
    })),
    excludedIngredients: [
      ...new Set(context.excludedIngredients.map(ingredientEnglish)),
    ],
    preferences: context.preferences.map(
      (value) => preferenceNames[value] ?? value,
    ),
  };
}
const steam = [
  "Wash the ingredients, cut them into small pieces and put them in a heatproof container. Add drinking water to the rice cooker's outer pot as its instructions specify.",
  "Steam until fully cooked. Avoid steam when opening the lid and check that the center is hot before eating.",
];
const microwave = [
  "Wash the ingredients, cut them into small pieces and put them in a microwave-safe container. Add a little drinking water and cover with a vented lid.",
  "Microwave in intervals, stirring or turning midway. Check that the ingredients are fully cooked and hot at the center. Adjust the time for the amount and appliance, and avoid burns.",
];
const boil = [
  "Wash the ingredients and cut them into small pieces. Bring enough drinking water for cooking to a boil in a pot.",
  "Add the ingredients and cook them fully. Check that the center is hot before removing them. Take care around hot water and steam.",
];
const recipes: Record<string, { title: string; steps: string[] }> = {
  "steam-tofu-greens": {
    title: "Rice-cooker tofu and leafy greens",
    steps: steam,
  },
  "steam-pumpkin-tofu": { title: "Steamed pumpkin and tofu", steps: steam },
  "steam-cabbage-carrot": {
    title: "Steamed cabbage and carrots",
    steps: steam,
  },
  "steam-sweet-potato": { title: "Steamed sweet potatoes", steps: steam },
  "steam-mushroom-tofu": { title: "Steamed mushrooms and tofu", steps: steam },
  "steam-egg-tofu": {
    title: "Steamed eggs with tofu",
    steps: [
      "Beat the eggs and add roughly the same volume of drinking water as egg liquid. Cut the tofu into small pieces and put both in a heatproof bowl. Wash your hands and clean utensils after contact with raw eggs.",
      "Add drinking water to the rice cooker's outer pot as its instructions specify, and steam the bowl. Cook until the egg is completely set and the center is fully cooked; continue steaming if needed.",
      "Avoid steam when removing the bowl and let it cool slightly before eating.",
    ],
  },
  "micro-tofu-greens": {
    title: "Microwave tofu and leafy greens",
    steps: microwave,
  },
  "micro-pumpkin": { title: "Microwave pumpkin", steps: microwave },
  "micro-cabbage": { title: "Microwave cabbage", steps: microwave },
  "micro-potato-carrot": {
    title: "Microwave potatoes and carrots",
    steps: microwave,
  },
  "micro-eggplant-tofu": {
    title: "Microwave eggplant and tofu",
    steps: microwave,
  },
  "boil-greens-tofu": { title: "Boiled leafy greens and tofu", steps: boil },
  "boil-cabbage-mushroom": {
    title: "Boiled cabbage and mushrooms",
    steps: boil,
  },
  "boil-broccoli-carrot": { title: "Boiled broccoli and carrots", steps: boil },
  "boil-pumpkin-tofu": { title: "Boiled pumpkin and tofu", steps: boil },
  "stove-egg-tomato": {
    title: "Stovetop tomato and eggs",
    steps: [
      "Wash the tomatoes under running drinking water and cut them into small pieces. Beat the eggs in a bowl. Wash your hands and clean utensils after handling raw egg.",
      "Simmer the tomatoes in a little drinking water until soft. Add the beaten eggs and stir gently.",
      "Cook until the egg is completely set and no liquid egg remains. Serve with a clean utensil.",
    ],
  },
  "boil-egg": {
    title: "Boiled eggs",
    steps: [
      "Check that the eggshells are intact. Put the eggs in a pot and cover with drinking water. Wash your hands after handling raw eggs.",
      "Bring to a boil and continue cooking until the whites and yolks are completely set. Cooking time alone does not guarantee doneness.",
      "Remove with clean utensils, let cool slightly, peel and cut open to check that they are fully cooked.",
    ],
  },
  "steam-rice": {
    title: "Rice-cooker white rice",
    steps: [
      "Rinse the white rice and put it in the inner pot. Add drinking water according to the rice packaging and rice-cooker instructions, and add water to the outer pot as directed.",
      "Cook and rest the rice according to the appliance instructions until fully cooked. Cook in batches for the total amount and do not exceed the appliance capacity.",
      "Serve with a clean rice paddle and eat while hot. Do not leave it at room temperature for a long time.",
    ],
  },
  "raw-cucumber-tomato": {
    title: "Cucumber and tomato plate",
    steps: [
      "Use fresh, intact ingredients suitable for eating raw. Wash under running drinking water.",
      "Use a clean knife and cutting board to cut into small, easy-to-eat pieces. Do not add unlisted sauces.",
      "Eat immediately after cutting. If the source or any restriction on raw foods is unclear, confirm it before choosing this dish.",
    ],
  },
  "raw-tomato": {
    title: "Fresh-cut tomatoes",
    steps: [
      "Choose fresh tomatoes suitable for eating raw and wash under running drinking water.",
      "Use a clean knife to remove the stem and cut into small pieces. Eat immediately; confirm any unclear restriction on raw foods first.",
    ],
  },
  "steam-potato": { title: "Rice-cooker steamed potatoes", steps: steam },
};
export function englishCard(card: MealCard): MealCard {
  const recipe = recipes[card.id];
  if (!recipe)
    throw new Error(`Missing English catalog translation: ${card.id}`);
  return {
    ...card,
    title: recipe.title,
    steps: [...recipe.steps],
    fromPantry: card.fromPantry.map((item) => ({
      ...item,
      name: ingredientEnglish(item.name),
    })),
    toBuy: card.toBuy.map((item) => ({
      ...item,
      name: ingredientEnglish(item.name),
    })),
    missingPrices: card.missingPrices.map(ingredientEnglish),
    unknownPantry: card.unknownPantry.map(ingredientEnglish),
  };
}

const questions: Record<string, string> = {
  "請從訊息和條件中移除聯絡方式或證件資料，再告訴我想怎麼安排這餐。":
    "Please remove contact details or identity information from your message and meal conditions before continuing.",
  "請在「這餐的條件」確認份數與料理時間。可填 1 到 12 人、1 到 7 餐及最多 360 分鐘。":
    "Please confirm the servings and cooking time in Meal conditions: 1–12 people, 1–7 meals and up to 360 minutes.",
  "請在「這餐的條件」填寫以新台幣計算的採買預算，金額可留白。":
    "Please enter the shopping budget in Taiwan dollars in Meal conditions. You may leave the amount blank.",
  "請先確認需要排除的食材，再到「這餐的條件」填入，並取消勾選「有些條件不太確定」。":
    "Please confirm which ingredients must be excluded, enter them in Meal conditions, and clear the uncertain conditions checkbox before continuing.",
  "如果有需要排除的食材，請直接告訴我名稱，或在「這餐的條件」填入。":
    "If ingredients must be excluded, please tell me their names or enter them in Meal conditions.",
  "目前支援電鍋、微波爐、爐具或免開火的簡易餐點。請在「這餐的條件」確認可用設備和排除食材。":
    "The catalog supports simple rice-cooker, microwave, stove and no-cook dishes. Please confirm the available equipment and excluded ingredients in Meal conditions.",
  "這項要求需要先確認。請在「這餐的條件」填入必須排除的食材、可用設備或時間上限。":
    "This requirement needs confirmation. Please enter the ingredients that must be excluded, available equipment or time limit in Meal conditions.",
  "請在「這餐的條件」確認後移除排除食材，我會依更新的清單重算。":
    "Please confirm and remove the excluded ingredient in Meal conditions. I will recalculate using the updated list.",
  "請把品項、包裝數量與總價填進「這餐的條件」的採買價格，我就能套用這筆報價。":
    "Please enter the ingredient, package quantity and total package price in Meal conditions so I can apply the quote.",
};
export function englishQuestion(question: string): string {
  return (
    questions[question] ??
    (/\p{Script=Han}/u.test(question)
      ? "Please confirm the servings, budget, ingredients, equipment and restrictions in Meal conditions before continuing."
      : question)
  );
}
