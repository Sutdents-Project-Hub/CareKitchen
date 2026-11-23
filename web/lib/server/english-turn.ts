import type {
  Equipment,
  ItemAmount,
  MealContext,
  PriceQuote,
  Unit,
} from "../contracts.ts";
import { canonicalIngredient } from "./meals.ts";

const equipmentPatterns: Array<[RegExp, Equipment]> = [
  [/\brice cooker\b/i, "rice_cooker"],
  [/\bmicrowave(?: oven)?\b/i, "microwave"],
  [/\b(?:stove|hob|hotplate|induction cooker)\b/i, "stove"],
  [/\b(?:no[- ]cook|no cooking|without cooking)\b/i, "no_cook"],
];
const identity =
  /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b09\d{2}[- ]?\d{3}[- ]?\d{3}\b|\b[A-Z][12]\d{8}\b/i;
const medical =
  /\b(?:medication|medications|medicine|medicines|prescription|dosage|diagnos\w*|treatment|insulin|diabetes|diabetic|kidney disease|hypertension|chemotherapy|swallow\w*|dysphagia|rash|hives|chok\w*|breathing difficult\w*|difficulty breathing|swollen (?:lips|throat)|drug interactions?)\b/i;
const quantityPattern = "(\\d+(?:\\.\\d{1,2})?)";
const unitPattern =
  "(grams?|g|millilit(?:er|re)s?|ml|items?|pieces?|eggs?|servings?|portions?)";
const units: Record<string, Unit> = {
  g: "g",
  gram: "g",
  grams: "g",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  item: "個",
  items: "個",
  piece: "個",
  pieces: "個",
  egg: "個",
  eggs: "個",
  serving: "份",
  servings: "份",
  portion: "份",
  portions: "份",
};
const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};
const numberPattern =
  "(?:\\d+(?:\\.\\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)";
const toNumber = (value: string) =>
  numberWords[value.toLowerCase()] ?? Number(value);
const sameName = (a: string, b: string) =>
  canonicalIngredient(a) === canonicalIngredient(b);
const splitFoods = (value: string) =>
  value
    .split(/\s*,\s*|\s+(?:and|or)\s+|\s*&\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

function foodName(raw: string): string | null {
  const value = raw
    .trim()
    .replace(/^(?:some|a little|the)\s+/i, "")
    .replace(/\s+(?:please|for now)$/i, "");
  if (
    !/^[a-z][a-z -]{0,31}$/i.test(value) ||
    /\b(?:budget|minutes?|people|person|cooker|microwave|stove|meals?|dinner|equipment|anything|everything|restrictions?|rules?|questions?|guarantee|safe|shopping|buy|cook|use|have|need|only|else)\b/i.test(
      value,
    )
  )
    return null;
  return canonicalIngredient(value);
}

function parseAmount(raw: string): ItemAmount | null {
  const suffix = raw.match(
    new RegExp(`^(.+?)\\s+${quantityPattern}\\s*${unitPattern}$`, "i"),
  );
  const prefix = raw.match(
    new RegExp(
      `^${quantityPattern}\\s*${unitPattern}(?:\\s+of)?\\s+(.+)$`,
      "i",
    ),
  );
  const matched = suffix
    ? [suffix[1], suffix[2], suffix[3]]
    : prefix
      ? [prefix[3], prefix[1], prefix[2]]
      : null;
  if (matched) {
    const name = foodName(matched[0]);
    const quantity = Number(matched[1]);
    if (name && quantity > 0 && quantity <= 10_000)
      return { name, quantity, unit: units[matched[2].toLowerCase()] };
    return null;
  }
  const counted = raw.match(/^(\d+)\s+(eggs?)$/i);
  if (counted && Number(counted[1]) > 0 && Number(counted[1]) <= 10_000)
    return { name: "雞蛋", quantity: Number(counted[1]), unit: "個" };
  const name = foodName(raw);
  return name ? { name, quantity: null, unit: null } : null;
}

function quoteFrom(raw: string): PriceQuote | null {
  const match = raw
    .trim()
    .match(
      new RegExp(
        `^(.+?)\\s+(?:(?:a|one|1)\\s+(?:package|pack|bag|box|bottle)\\s+(?:of\\s+)?)?${quantityPattern}\\s*${unitPattern}\\s*(?:costs?|is|for|:)?\\s*(?:NT\\$|TWD)\\s*(\\d+(?:\\.\\d{1,2})?)(?:\\s*(?:per|a|each)\\s*(?:package|pack|bag|box|bottle))?$`,
        "i",
      ),
    );
  if (!match) return null;
  const item = parseAmount(`${match[1]} ${match[2]} ${match[3]}`);
  const priceTwd = Number(match[4]);
  return item?.quantity && item.unit && priceTwd <= 1_000_000
    ? { name: item.name, quantity: item.quantity, unit: item.unit, priceTwd }
    : null;
}

export function requiresEnglishReferral(text: string) {
  return medical.test(text.normalize("NFKC"));
}

export function requestsShoppingEnglish(text: string) {
  return /\b(?:shopping|grocery|purchase)\s+(?:list|summary)|\bwhat (?:do (?:I|we) need to|should (?:I|we)) buy\b|\blist (?:what|the (?:ingredients|items)) (?:I|we) need\b/i.test(
    text,
  );
}

/** English edits are deterministic; hard constraints never depend on a model translation. */
export function inspectEnglishTurn(
  text: string,
  context: MealContext,
): {
  context: MealContext;
  intent: "plan" | "swap" | "shopping" | "budget" | "clarify" | "refer";
  question?: string;
} {
  const normalized = text.normalize("NFKC").trim();
  if (medical.test(normalized)) return { context, intent: "refer" as const };
  const clarify = (question: string, updated = context) => ({
    context: updated,
    intent: "clarify" as const,
    question,
  });
  if (identity.test(normalized) || identity.test(JSON.stringify(context)))
    return clarify(
      "Please remove contact details or identity information from your message and meal conditions.",
    );
  const updated: MealContext = {
    ...context,
    pantryItems: [...context.pantryItems],
    purchasePrices: [...context.purchasePrices],
    excludedIngredients: [...context.excludedIngredients],
    equipment: [...context.equipment],
    preferences: [...context.preferences],
  };
  const sentences = normalized
    .split(/[;.!?\n](?!\d)/)
    .map((part) => part.trim())
    .filter(Boolean);
  const latest = (pattern: RegExp) => [...normalized.matchAll(pattern)].at(-1);
  if (
    /-\s*\d+(?:\.\d+)?\s*(?:people|persons?|servings?|meals?|minutes?|mins?)\b/i.test(
      normalized,
    )
  )
    return clarify(
      "Please use positive whole numbers for people, meals, and cooking minutes in Meal conditions.",
    );
  const servings = latest(
    new RegExp(
      `\\b(${numberPattern})\\s*(?:people|persons?|servings?)\\b`,
      "gi",
    ),
  );
  const meals = latest(new RegExp(`\\b(${numberPattern})\\s*meals?\\b`, "gi"));
  // Requests for "two simple meals" ask for candidates, not multiple meals of food.
  const actualMeals =
    meals &&
    !/\b(?:suggest|recommend|give|show|candidates?|options?)\b/i.test(
      normalized.slice(Math.max(0, meals.index! - 30), meals.index),
    )
      ? meals
      : null;
  const minutes = latest(
    new RegExp(`\\b(${numberPattern})\\s*(?:minutes?|mins?)\\b`, "gi"),
  );
  for (const [match, limit] of [
    [servings, 12],
    [actualMeals, 7],
    [minutes, 360],
  ] as const) {
    if (
      match &&
      (!Number.isInteger(toNumber(match[1])) ||
        toNumber(match[1]) < 1 ||
        toNumber(match[1]) > limit)
    )
      return clarify(
        "Please enter 1–12 people, 1–7 meals, and a cooking time of 1–360 minutes in Meal conditions.",
      );
  }
  if (servings) updated.servings = toNumber(servings[1]);
  else if (
    /\b(?:just (?:me|myself)|(?:I (?:am |will be )?(?:cooking|eating)|cook|cooking) (?:only )?for (?:myself|me alone)|I (?:eat|am eating) alone)\b/i.test(
      normalized,
    )
  )
    updated.servings = 1;
  else if (
    /\b(?:now|change|instead)\b.{0,25}\b(?:family|friends|together|group)\b/i.test(
      normalized,
    )
  ) {
    updated.servings = null;
    return clarify(
      "How many people will eat? Please enter the new number so I can recalculate every condition.",
      updated,
    );
  }
  if (actualMeals) updated.mealCount = toNumber(actualMeals[1]);
  if (minutes) updated.maxTimeMinutes = toNumber(minutes[1]);

  const budget =
    latest(
      /\bbudget\s*(?:(?:is|of|to|at|now|only|maximum|under|within|up to|change(?:d)? to|reduce(?:d)? to)\s*)*[:=]?\s*(?:NT\$|TWD)?\s*(-?\d+(?:\.\d+)?)\b/gi,
    ) ?? latest(/(?:NT\$|TWD)\s*(-?\d+(?:\.\d+)?)\s+budget\b/gi);
  if (
    /\b(?:USD|EUR|JPY|RMB|HKD|US dollars?|euros?|yen)\b|(?<!NT)\$/i.test(
      normalized,
    )
  )
    return clarify(
      "Please provide the budget and package prices in Taiwan dollars (NT$ or TWD).",
      updated,
    );
  if (budget) {
    const value = Number(budget[1]);
    if (
      value < 0 ||
      value > 1_000_000 ||
      Math.abs(value * 100 - Math.round(value * 100)) > 0.000001
    )
      return clarify(
        "Please enter a Taiwan-dollar budget from 0 to 1,000,000, with at most two decimal places.",
        updated,
      );
    updated.budgetTwd = value;
  } else if (
    /\bbudget\s+(?:is|to|now|of|[:=])\s*(?:NT\$|TWD|\d)/i.test(normalized)
  )
    return clarify(
      "Please enter a valid Taiwan-dollar budget in Meal conditions.",
      updated,
    );

  if (
    /\b(?:no (?:working |available |cooking )?equipment|no appliances|cannot cook|can't cook)\b/i.test(
      normalized,
    )
  ) {
    updated.equipment = [];
    return clarify(
      "Please confirm the available cooking equipment or select no-cook in Meal conditions.",
      updated,
    );
  }
  let quoteCount = 0;
  for (const clause of sentences.flatMap((sentence) =>
    sentence.split(/,|\s+and\s+(?=[a-z ]+\d+\s*(?:g|ml|items?))/i),
  )) {
    const quote = quoteFrom(clause);
    if (!quote) continue;
    quoteCount++;
    const index = updated.purchasePrices.findIndex(
      (item) =>
        sameName(item.name, quote.name) &&
        item.quantity === quote.quantity &&
        item.unit === quote.unit,
    );
    if (index >= 0) updated.purchasePrices[index] = quote;
    else if (updated.purchasePrices.length < 30)
      updated.purchasePrices.push(quote);
  }

  for (const sentence of sentences) {
    const clauses = sentence.split(/,|\bbut\b|\bhowever\b/i);
    for (const clause of clauses) {
      const found = equipmentPatterns
        .flatMap(([pattern, option]) => {
          const match = pattern.exec(clause);
          return match
            ? [
                {
                  option,
                  index: match.index,
                  end: match.index + match[0].length,
                },
              ]
            : [];
        })
        .sort((a, b) => a.index - b.index);
      if (
        found.length &&
        /\b(?:only|only have|only use|switch to|instead use|left with)\b/i.test(
          clause,
        )
      )
        updated.equipment = [];
      let excluded = false;
      let previousEnd = 0;
      for (const match of found) {
        const prefix = clause.slice(previousEnd, match.index);
        const suffix = clause.slice(match.end);
        excluded =
          /\b(?:no|not|without|cannot|can't|do not|don't|unavailable|broken)\s*(?:have|use)?\s*(?:a|the)?\s*$/i.test(
            prefix,
          ) ||
          (excluded && /^\s*(?:and|or|&)\s*(?:a|the)?\s*$/i.test(prefix)) ||
          /^\s*(?:is |are )?(?:broken|broke|unavailable|stopped working|cannot be used|can't be used|isn't available)/i.test(
            suffix,
          ) ||
          /\b(?:both|all)\b.{0,20}\b(?:broken|unavailable)\b/i.test(clause) ||
          /\b(?:are|both)\s+(?:broken|unavailable|not working)\s*$/i.test(
            clause,
          );
        updated.equipment = updated.equipment.filter(
          (item) => item !== match.option,
        );
        if (!excluded) updated.equipment.push(match.option);
        previousEnd = match.end;
      }
      if (
        /\b(?:no open flame|cannot use (?:an? )?open flame|no[- ]cook|without cooking)\b/i.test(
          clause,
        )
      )
        updated.equipment = [
          ...updated.equipment.filter((item) => item !== "stove"),
          "no_cook",
        ];
    }
    const pantry =
      sentence.match(/\b(?:I|we)\s+(?:(?:only|also)\s+)?have\s+(.+)$/i) ??
      sentence.match(
        /\b(?:pantry|ingredients)\s*(?:contains?|are|:|=)\s*(.+)$/i,
      );
    if (
      pantry &&
      !equipmentPatterns.some(([pattern]) => pattern.test(pantry[1]))
    ) {
      const parts = splitFoods(pantry[1]);
      const items = parts.map(parseAmount);
      if (parts.some((part, index) => !items[index] && /\d/.test(part)))
        return clarify(
          "Please give each pantry ingredient a quantity and unit, such as tofu 150 g or eggs 2 items. Unknown quantities can be left blank.",
          updated,
        );
      const valid = items.filter((item) => item !== null);
      if (/\bonly have\b/i.test(sentence) && valid.length)
        updated.pantryItems = updated.pantryItems.filter((item) =>
          valid.some((provided) => sameName(item.name, provided.name)),
        );
      for (const item of valid) {
        const index = updated.pantryItems.findIndex((existing) =>
          sameName(existing.name, item.name),
        );
        if (index >= 0) updated.pantryItems[index] = item;
        else if (updated.pantryItems.length < 30)
          updated.pantryItems.push(item);
      }
    }
    const depleted =
      sentence.match(
        /^(?:I|we)\s+(?:have\s+)?(?:used up|ran out of|run out of)\s+(.+)$/i,
      ) ?? sentence.match(/^(.+?)\s+(?:is|are)\s+(?:used up|gone|finished)$/i);
    if (depleted)
      for (const raw of splitFoods(depleted[1])) {
        const name = foodName(raw);
        if (name)
          updated.pantryItems = updated.pantryItems.filter(
            (item) => !sameName(item.name, name),
          );
      }
    const preference = sentence.match(
      /\b(?:I|we)\s+(?:prefer|would like)\s+(.+)$/i,
    );
    if (
      preference &&
      preference[1].length <= 32 &&
      !updated.preferences.includes(preference[1]) &&
      updated.preferences.length < 16
    )
      updated.preferences.push(preference[1]);
  }
  updated.equipment = [...new Set(updated.equipment)];
  if (/\b(?:can buy|may buy|can shop|shopping is allowed)\b/i.test(normalized))
    updated.onlyPantry = false;
  if (
    /\b(?:only (?:use|using) (?:my |our |the )?(?:pantry|existing|available)|do not buy|don't buy|no shopping|no purchases)\b/i.test(
      normalized,
    )
  )
    updated.onlyPantry = true;

  if (
    /\b(?:remove|cancel|lift)\s+(?:the )?(?:exclusion|restriction)|\b(?:can|may) eat\b.{0,20}\b(?:again|now)\b/i.test(
      normalized,
    )
  )
    return clarify(
      "Please confirm and remove the excluded ingredient in Meal conditions. I will recalculate using that updated list.",
      updated,
    );
  const unknownRestriction =
    /\b(?:may|might|not sure|uncertain|cannot remember|can't remember|forgot)\b.{0,70}\b(?:restrict\w*|allerg\w*|avoid)\b|\b(?:restrict\w*|allerg\w*)\b.{0,70}\b(?:not sure|uncertain|cannot remember|can't remember|forgot)\b/i.test(
      normalized,
    );
  const unspecifiedRestriction =
    /\b(?:I|we)\s+(?:have|has)\s+(?:some |dietary |food |a )*restrictions?\b/i.test(
      normalized,
    ) &&
    !/\b(?:avoid|exclude|no|cannot eat|can't eat|allergic to)\b/i.test(
      normalized,
    );
  if (
    unknownRestriction ||
    unspecifiedRestriction ||
    (/\ballerg(?:y|ies|ic)\b/i.test(normalized) &&
      !/\ballergic to\s+[a-z]|\bno (?:food )?allergies\b/i.test(normalized))
  )
    updated.uncertainty = true;
  let unresolvedExclusion = false;
  for (const clause of normalized.split(/[;.!?\n](?!\d)|\bbut\b/i)) {
    if (
      unknownRestriction ||
      /\bno (?:food )?(?:allergies|restrictions)/i.test(clause)
    )
      continue;
    const raw = clause.match(
      /\b(?:allergic to|need to avoid|avoid|exclude|cannot eat|can't eat|cannot have|can't have|do not (?:eat|use|add)|don't (?:eat|use|add)|without|no)\s+(.+)$/i,
    )?.[1];
    const free = clause.match(/\b(egg|soy|gluten|dairy)[- ]free\b/i)?.[1];
    if (!raw && !free) {
      if (
        /\b(?:same|unchanged|keep)\b.{0,25}\b(?:exclusions?|restrictions?)\b/i.test(
          clause,
        )
      )
        continue;
      if (
        /\b(?:allerg\w*|restrict\w*|cannot eat|can't eat|cannot have|can't have|avoid|exclude)\b/i.test(
          clause,
        )
      )
        updated.uncertainty = true;
      continue;
    }
    if (raw && /^(?:shopping|purchases|cooking|open flame)\b/i.test(raw))
      continue;
    const foods = splitFoods(raw ?? free!).map((part) =>
      part
        .replace(/^(?:no|avoid|exclude)\s+/i, "")
        .replace(
          /\s+(?:and |but )?(?:keep|everything|other|please|for now)\b.*$/i,
          "",
        )
        .trim(),
    );
    for (const rawFood of foods) {
      if (
        /\b(?:budget|cooker|microwave|stove|recommend|suggest|plan|please|keep|everything|unchanged)\b|^(?:for|only|now|can you|I have)\b/i.test(
          rawFood,
        )
      )
        continue;
      const name = foodName(rawFood);
      if (!name) {
        unresolvedExclusion = true;
        continue;
      }
      if (
        !updated.excludedIngredients.some((item) => sameName(item, name)) &&
        updated.excludedIngredients.length < 24
      )
        updated.excludedIngredients.push(name);
      if (/^[a-z]/i.test(name)) unresolvedExclusion = true;
    }
  }
  if (updated.uncertainty)
    return clarify(
      "Please confirm which ingredients must be excluded, enter them in Meal conditions, and clear the uncertain conditions checkbox before continuing.",
      updated,
    );
  if (unresolvedExclusion)
    return clarify(
      "Please confirm the ingredient names to exclude in Meal conditions. I cannot verify an unspecified or unsupported restriction.",
      updated,
    );
  if (
    /\b(?:vegan|vegetarian|halal|kosher|low[- ]sodium|low[- ]sugar|low[- ]potassium|sodium limit|carbohydrate limit|special diet|must never|strict diet|deep[- ]fr(?:y|ied)|air fr(?:y|ier)|oven|raw (?:fish|eggs?|meat)|undercooked)\b/i.test(
      normalized,
    )
  )
    return clarify(
      "This requirement needs confirmation. Please specify the excluded ingredients, available equipment, and time limit in Meal conditions; medical diet prescriptions need a qualified professional.",
      updated,
    );
  const priceQuery =
    /\b(?:prices?|costs?)\b.{0,25}\b(?:unknown|missing|not (?:known|checked|available))\b|\b(?:confirm|certain|sure|within|over|under|exceed|total)\b.{0,45}\b(?:budget|NT\$|TWD)|\bbudget\b.{0,30}\b(?:within|over|exceed|enough|certain)\b/i.test(
      normalized,
    );
  if (
    !priceQuery &&
    !quoteCount &&
    /(?:NT\$|TWD)\s*\d/i.test(normalized) &&
    !budget
  )
    return clarify(
      "Please enter the ingredient, package quantity, unit, and total package price in Meal conditions, for example tofu 300 g costs NT$45 per package.",
      updated,
    );
  if (requestsShoppingEnglish(normalized))
    return { context: updated, intent: "shopping" as const };
  if (priceQuery) return { context: updated, intent: "budget" as const };
  if (
    /\b(?:swap|replace|another (?:meal|option)|different (?:meal|option)|change (?:the )?(?:meal|ingredient))\b/i.test(
      normalized,
    )
  )
    return { context: updated, intent: "swap" as const };
  if (
    JSON.stringify(updated) !== JSON.stringify(context) ||
    /\b(?:meal|dinner|lunch|breakfast|cook|recommend|suggest|plan|eat|food|budget)\b/i.test(
      normalized,
    )
  )
    return { context: updated, intent: "plan" as const };
  return clarify(
    "Please tell me the number of people, available ingredients, budget, equipment, or how you want to adjust the meal.",
    updated,
  );
}
