import {
  emptyContext,
  type ChatReply,
  type MealCard,
  type MealContext,
  type Persona,
} from "../contracts.ts";
import { assessMeals, canonicalIngredient, ingredientExcluded } from "./meals.ts";
import {
  englishCard,
  englishContext,
  englishQuestion,
  ingredientEnglish,
} from "./english.ts";
import { inspectTurn, requestsShopping, type Turn } from "./turn.ts";

export type RankableMeal = Pick<
  MealCard,
  "id" | "title" | "minutes" | "missingPrices"
> & {
  ingredients: string[];
  pantryMatches: string[];
  purchaseCount: number;
};

export const clarificationFields = [
  "restriction",
  "servings",
  "equipment",
  "budget",
  "time",
  "pantry",
  "goal",
] as const;

export type Decision = {
  action: "keep" | "clarify" | "refer" | "shopping" | "swap";
  preferredIds: string[];
  clarification?: {
    field: (typeof clarificationFields)[number];
    evidence: string;
  } | null;
};

export type RankMeals = (
  turn: Pick<Turn, "persona" | "text" | "previousMealIds" | "language">,
  context: Pick<
    MealContext,
    | "servings"
    | "mealCount"
    | "equipment"
    | "preferences"
    | "excludedIngredients"
    | "budgetTwd"
    | "maxTimeMinutes"
    | "onlyPantry"
  >,
  options: RankableMeal[],
) => Promise<{
  decision: Decision;
  modelInfo: NonNullable<ChatReply["modelInfo"]>;
}>;

const referral =
  "這項問題需要專業人員確認。用藥請問醫師或藥師，食物反應、疾病飲食或吞嚥問題請向醫療專業人員確認。日常備餐時，您可以填入已確認要避開的食材。";

const intros: Record<Persona, string> = {
  elder: "您可以挑一道喜歡的，點開就能看簡單做法。",
  caregiver:
    "每道都按目前的人數、設備和排除食材重新檢查。請核對家中食材份量及包裝成分。",
  family:
    "每道都分出家裡已有和需要採買的項目。您可以在餐點卡預覽並複製給家人的摘要。",
};

function pickInOrder(cards: MealCard[], preferredIds: string[]) {
  const priority = [...new Set(preferredIds)];
  return [...cards].sort((a, b) => {
    const rankA = priority.indexOf(a.id);
    const rankB = priority.indexOf(b.id);
    return (
      (rankA < 0 ? priority.length : rankA) -
      (rankB < 0 ? priority.length : rankB)
    );
  });
}

function requestedCount(text: string, persona: Persona, english = false) {
  const englishCount =
    english &&
    text.match(
      /\b(one|two|three|[123])\s+(?:meal(?:s)?|dish(?:es)?|option(?:s)?|candidate(?:s)?)\b/i,
    );
  if (englishCount)
    return /^(?:one|1)$/i.test(englishCount[1])
      ? 1
      : /^(?:three|3)$/i.test(englishCount[1])
        ? 3
        : 2;
  const count = text
    .normalize("NFKC")
    .match(
      /([一二兩三123])\s*(?:道(?!歉)|[種個](?=選擇|做法|餐點|菜|料理|方案|方向))/,
    );
  if (!count) return persona === "elder" ? 2 : 3;
  return /[一1]/.test(count[1]) ? 1 : /[三3]/.test(count[1]) ? 3 : 2;
}

function modelQuestion(
  decision: Decision | undefined,
  text: string,
  context: MealContext,
  english = false,
) {
  const clarification =
    decision?.action === "clarify" ? decision.clarification : null;
  const phrase = clarification?.evidence.trim();
  if (
    !clarification ||
    !phrase ||
    phrase.length > 90 ||
    !text.normalize("NFKC").includes(phrase.normalize("NFKC"))
  )
    return null;
  const parsed = inspectTurn(
    phrase,
    emptyContext,
    english ? "en" : undefined,
  ).context;
  if (english) {
    switch (clarification.field) {
      case "goal":
        return null;
      case "restriction":
        return parsed.excludedIngredients.length > 0 &&
          parsed.excludedIngredients.every((item) =>
            context.excludedIngredients.some(
              (stored) =>
                canonicalIngredient(item) === canonicalIngredient(stored),
            ),
          )
          ? null
          : "Which ingredient needs to be excluded from this meal? I will keep the other confirmed restrictions.";
      case "servings":
        return /people|persons?|servings?|portions?|guests?|more|fewer/i.test(
          phrase,
        ) && parsed.servings === null
          ? "How many servings should I prepare this time? I will recalculate for that number."
          : null;
      case "equipment":
        return /cooker|microwave|stove|heat|cook|appliance/i.test(phrase) &&
          parsed.equipment.length === 0 &&
          /change|only|cannot|can.t|broken|unavailable|left/i.test(phrase)
          ? "Can you use a rice cooker, microwave or stove, or do you need a no-cook option?"
          : null;
      case "budget":
        return parsed.budgetTwd === null &&
          /budget|spend|cost|total/i.test(phrase) &&
          /change|limit|reduce|lower|raise|adjust|under/i.test(phrase)
          ? "What is the TWD limit for new purchases for this meal?"
          : null;
      case "time":
        return /minutes?|hours?|time/i.test(phrase) &&
          parsed.maxTimeMinutes === null
          ? "How many minutes can you spend preparing this meal?"
          : null;
      case "pantry":
        return context.onlyPantry && context.pantryItems.length === 0
          ? "To use only your pantry, please list the ingredients you have and their approximate amounts."
          : null;
    }
  }
  switch (clarification.field) {
    case "goal":
      return null;
    case "restriction":
      return parsed.excludedIngredients.length > 0 &&
        parsed.excludedIngredients.every((item) =>
          context.excludedIngredients.some(
            (stored) =>
              canonicalIngredient(item) === canonicalIngredient(stored),
          ),
        )
        ? null
        : "請確認這餐需要避開哪一種食材。我會保留其他已確認的限制。";
    case "servings":
      return /人|位|份|倍|加|減/.test(phrase) && parsed.servings === null
        ? "這次一共要準備幾人份？我會依新的人數重新核算。"
        : null;
    case "equipment":
      return /鍋|爐|烤|加熱|開火/.test(phrase) &&
        parsed.equipment.length === 0 &&
        /改用|只剩|只有|用不了|不能加熱/.test(phrase)
        ? "這次能使用電鍋、微波爐、爐具，還是要免開火？"
        : null;
    case "budget":
      return parsed.budgetTwd === null &&
        /預算|餐費|花費|開銷|成本|總價/.test(phrase) &&
        /改|抓|控制|壓|調整|減|降/.test(phrase)
        ? "這餐新增採買的預算上限是多少元？"
        : null;
    case "time":
      return /分鐘|半小時|小時/.test(phrase) && parsed.maxTimeMinutes === null
        ? "這餐最多可以準備幾分鐘？"
        : null;
    case "pantry":
      return context.onlyPantry && context.pantryItems.length === 0
        ? "您想只用現有食材，請告訴我手邊有哪些食材和大概份量。"
        : null;
  }
}

function explainMeal(
  card: MealCard,
  persona: Persona,
  context: MealContext,
  english = false,
) {
  if (english) {
    if (persona === "caregiver")
      return context.excludedIngredients.length
        ? `Recalculated for ${card.servings} serving(s), with confirmed exclusions checked against the recipe ingredients.`
        : `Calculated for ${card.servings} serving(s), using the equipment confirmed for this turn.`;
    if (persona === "family") {
      if (card.unknownPantry.length)
        return "Check the amounts at home before confirming the full shopping list.";
      return card.toBuy.length
        ? `${card.toBuy.length} item(s) to buy${card.missingPrices.length ? `; ${card.missingPrices.length} price(s) still need confirmation` : ""}.`
        : "The amounts you entered cover this dish using the ingredients at home.";
    }
    const available = [
      ...new Set(
        card.fromPantry
          .filter((item) => item.quantity !== null)
          .map(({ name }) => ingredientEnglish(name)),
      ),
    ];
    return available.length
      ? `Start with the ${available.join(", ")} you already have.`
      : `The instructions have ${card.steps.length} steps.`;
  }
  if (persona === "caregiver") {
    return context.excludedIngredients.length
      ? `按 ${card.servings} 人份重算，已依食譜材料檢查排除項目。`
      : `按 ${card.servings} 人份計算，使用這次確認的設備。`;
  }
  if (persona === "family") {
    if (card.unknownPantry.length)
      return "先核對家中份量，再確認這道的完整採買清單。";
    return card.toBuy.length
      ? `需要採買 ${card.toBuy.length} 項${card.missingPrices.length ? `，其中 ${card.missingPrices.length} 項價格待確認` : ""}。`
      : "依你填的份量，這道可以用家裡現有的食材完成。";
  }
  const available = [
    ...new Set(
      card.fromPantry
        .filter((item) => item.quantity !== null)
        .map(({ name }) => name),
    ),
  ];
  return available.length
    ? `可以先用手邊的${available.join("、")}。`
    : `做法整理成 ${card.steps.length} 個步驟。`;
}

const englishList = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

function pantryMatchCount(card: MealCard) {
  return new Set(card.fromPantry.map(({ name }) => canonicalIngredient(name))).size;
}

function explainPrevious(cards: MealCard[]) {
  return cards.map((card) => {
    const { title, fromPantry, toBuy, missingPrices, unknownPantry } = englishCard(card);
    const pantry = [...new Set(fromPantry.map(({ name }) => name))];
    const reasons = [
      pantry.length ? `Uses ${englishList.format(pantry)} from your pantry` : "Fits the equipment and servings you selected",
      toBuy.length ? `Needs ${toBuy.length} ${toBuy.length === 1 ? "ingredient" : "ingredients"} to buy` : "Lists no purchases",
    ];
    if (missingPrices.length || unknownPantry.length) reasons.push("Some amounts or prices still need confirmation");
    return `${title}. ${reasons.join(". ")}.`;
  }).join(" ");
}

async function plan(turn: Turn, rank?: RankMeals): Promise<ChatReply> {
  const english = turn.language === "en";
  const localizedReferral = english
    ? "This question needs a professional. Ask a doctor or pharmacist about medicines, and a medical professional about food reactions, disease-specific diets or swallowing problems. For everyday meal planning, you can enter ingredients already confirmed for exclusion."
    : referral;
  const local = inspectTurn(turn.text, turn.context, turn.language);
  const { context } = local;
  const reply: ChatReply = {
    context,
    cards: [],
    mode: rank ? "openai" : "local",
    message: "",
    responseType: "ask_clarification",
    unknowns: [],
  };
  if (local.intent === "refer")
    return {
      ...reply,
      message: localizedReferral,
      responseType: "professional_referral",
    };
  if (local.intent === "clarify" && local.question)
    return {
      ...reply,
      message: english ? englishQuestion(local.question) : local.question,
    };

  if (context.servings === null || !context.equipment.length) {
    const missing = [];
    if (context.servings === null)
      missing.push(
        english ? "servings (for example, one person)" : "份量（例如一人份）",
      );
    if (!context.equipment.length)
      missing.push(
        english
          ? "equipment (for example, rice cooker only or no cooking)"
          : "設備（例如只有電鍋，或免開火）",
      );
    return {
      ...reply,
      message: english
        ? `Please confirm ${missing.join(" and ")}.`
        : `還需要確認${missing.join("和")}。`,
      unknowns: missing,
    };
  }
  const { cards: eligible, minimumOverBudgetTwd } = assessMeals(context);
  if (!eligible.length && minimumOverBudgetTwd !== null) {
    return {
      ...reply,
      message: english
        ? `The lowest known purchase subtotal among meals meeting the other conditions is TWD ${minimumOverBudgetTwd}, above your TWD ${context.budgetTwd} budget. You can use more pantry ingredients, reduce servings, or adjust the budget and recalculate.`
        : `其他條件適用的餐點，已知採買小計最低為 ${minimumOverBudgetTwd} 元，已超過 ${context.budgetTwd} 元預算。可以改用更多現有食材、減少份量，或調整預算後重算。`,
    };
  }
  if (!eligible.length) {
    return {
      ...reply,
      message: english
        ? context.onlyPantry
          ? "The current catalog has no combination that uses only this pantry. Add other ingredients you have, or allow purchases."
          : "The current catalog has no combination meeting these conditions. Check the exclusions, time and equipment, then choose which meal-planning conditions can change."
        : context.onlyPantry
          ? "目前的餐點庫沒有能只用這些庫存完成的搭配。可以補上家裡其他食材，或改為允許採買。"
          : "目前的餐點庫找不到符合這些條件的搭配。請核對排除食材、時間和設備，再看看哪些備餐條件能調整。",
    };
  }
  if (local.intent === "explain") {
    const prior = pickInOrder(
      eligible.filter(({ id }) => turn.previousMealIds.includes(id)),
      turn.previousMealIds,
    ).slice(0, 3);
    if (!prior.length)
      return { ...reply, message: "Ask for meal ideas first, and I can explain what each suggestion uses and costs." };
    return {
      ...reply,
      cards: prior.map((card) => ({ ...card, reason: explainMeal(card, turn.persona, context, true) })),
      message: explainPrevious(prior),
      responseType: "meal_candidates",
    };
  }

  const pantry = english ? context.pantryItems.filter(({ name }) =>
    !["水", "食用水", "飲用水"].includes(canonicalIngredient(name)) &&
    !ingredientExcluded(name, context.excludedIngredients),
  ) : [];
  const allowOtherDishes = /\b(?:show|suggest|give|try|recommend)\b.{0,30}\b(?:dishes|meals|options)\b.{0,25}\b(?:shop for|buy ingredients for|without using my pantry)\b/i.test(turn.text);
  if (pantry.length && !eligible.some((card) => pantryMatchCount(card) > 0) &&
      !allowOtherDishes && local.intent === "plan") {
    const names = englishList.format([...new Set(pantry.map(({ name }) => ingredientEnglish(name)))]);
    return {
      ...reply,
      message: `I don’t have a recipe that uses your ${names} with these conditions. Add another ingredient or available appliance, or say “Show dishes I can shop for.”`,
    };
  }

  const model = rank
    ? await rank(
        {
          persona: turn.persona,
          text: turn.text,
          previousMealIds: turn.previousMealIds,
          language: turn.language,
        },
        {
          servings: context.servings,
          mealCount: context.mealCount,
          equipment: context.equipment,
          preferences: english
            ? englishContext(context).preferences
            : context.preferences,
          excludedIngredients: english
            ? context.excludedIngredients.map(ingredientEnglish)
            : context.excludedIngredients,
          budgetTwd: context.budgetTwd,
          maxTimeMinutes: context.maxTimeMinutes,
          onlyPantry: context.onlyPantry,
        },
        (english ? eligible.map(englishCard) : eligible).map(
          ({ id, title, minutes, fromPantry, toBuy, missingPrices }) => ({
            id,
            title,
            minutes,
            missingPrices,
            ingredients: [...fromPantry, ...toBuy].map(({ name }) => name),
            pantryMatches: [...new Set(fromPantry.map(({ name }) => name))],
            purchaseCount: toBuy.length,
          }),
        ),
      )
    : undefined;
  if (model) reply.modelInfo = model.modelInfo;
  const decision = model?.decision;
  if (decision?.action === "refer")
    return {
      ...reply,
      message: localizedReferral,
      responseType: "professional_referral",
    };
  const followup = modelQuestion(decision, turn.text, context, english);
  if (followup) return { ...reply, message: followup };
  if (
    local.intent === "clarify" &&
    (!decision || decision.action === "clarify")
  ) {
    return {
      ...reply,
      message: english
        ? "Would you like meal ideas, a different option, or a shopping list?"
        : "您想請我推薦餐點、換一道，還是整理採買？",
    };
  }

  const swap = local.intent === "swap" || decision?.action === "swap";
  const shopping =
    local.intent === "shopping" ||
    (decision?.action === "shopping" &&
      (requestsShopping(turn.text) || local.intent === "clarify"));
  const candidates = swap
    ? eligible.filter(({ id }) => !turn.previousMealIds.includes(id))
    : eligible;
  const ordered = pickInOrder(candidates, decision?.preferredIds ?? []);
  if (pantry.length && !allowOtherDishes)
    ordered.sort((a, b) => pantryMatchCount(b) - pantryMatchCount(a));
  const cards = ordered
    .slice(0, requestedCount(turn.text, turn.persona, english))
    .map((card) => ({
      ...card,
      reason: explainMeal(card, turn.persona, context, english),
    }));

  if (cards.length === 0) {
    const message = english
      ? swap && eligible.length > 0
        ? "All meals meeting these conditions have already been shown. Change the available ingredients, time or equipment so I can look again."
        : "The current catalog has no combination meeting these conditions. Check exclusions, time, equipment and budget, then choose which conditions can change."
      : swap && eligible.length > 0
        ? "目前符合這些條件的餐點都已列過了。調整可用食材、時間或設備後，我可以再找。"
        : "目前的餐點庫找不到符合這些條件的搭配。請核對排除食材、時間、設備和預算，再看看哪些條件能調整。";
    return { ...reply, message };
  }
  const missingPrices = [
    ...new Set(cards.flatMap((card) => card.missingPrices)),
  ];
  const unknownPantry = [
    ...new Set(cards.flatMap((card) => card.unknownPantry)),
  ];
  const unknowns = [
    ...(missingPrices.length
      ? [
          english
            ? `Purchase prices to confirm: ${missingPrices.map(ingredientEnglish).join(", ")}`
            : `採買價格待確認：${missingPrices.join("、")}`,
        ]
      : []),
    ...(unknownPantry.length
      ? [
          english
            ? `Pantry amounts to confirm: ${unknownPantry.map(ingredientEnglish).join(", ")}`
            : `家中份量待確認：${unknownPantry.join("、")}`,
        ]
      : []),
  ];
  const count = english
    ? cards.length === 1
      ? "There is 1 option meeting the current conditions. "
      : `Found ${cards.length} meals for this turn. `
    : cards.length === 1
      ? "目前有 1 道符合條件的方向。"
      : `依這一輪的條件找到 ${cards.length} 道餐點。`;
  const allergyNote =
    (english ? /過敏|allerg/i.test(turn.text) : /過敏/.test(turn.text)) &&
    context.excludedIngredients.length
      ? english
        ? " Confirmed ingredients have been excluded from the recipe ingredients. Also check packaging labels and ask a professional about cross-contact risk."
        : "已依食譜材料排除您確認的食材。請另核對包裝標示，並向專業人員確認交叉接觸風險。"
      : "";
  const priceDetail =
    local.intent === "budget"
      ? missingPrices.length || unknownPantry.length
        ? english
          ? "Some purchase prices or pantry amounts are unconfirmed. See each known subtotal; the full totals cannot be confirmed yet."
          : "其中有採買價格或家中份量待確認，請看每道的已知小計；目前無法確認這些選項的總額。"
        : context.budgetTwd === null
          ? english
            ? "Purchase amounts are listed for each dish. Enter a budget to check for overspending."
            : "各道採買金額已列出。填入預算後，就能對照是否超支。"
          : english
            ? `Based on your supplied prices, the known new purchases for each option are within TWD ${context.budgetTwd}.`
            : `這些選項按您提供的價格核算，已知新增採買均未超過 ${context.budgetTwd} 元。`
      : "";
  const detail =
    priceDetail ||
    (shopping
      ? english
        ? "Choose a dish below to see what to buy and which prices need confirmation. You can preview and copy its shopping summary."
        : "請從下面選一道，查看待買項目與待確認價格，也可以預覽再複製採買摘要。"
      : english
        ? {
            elder:
              "Choose a dish you like and open it for simple instructions.",
            caregiver:
              "Each dish is rechecked for the current servings, equipment and exclusions. Check pantry amounts and packaging ingredients.",
            family:
              "Each dish separates pantry items from purchases. Preview and copy a summary from its card to share with your family.",
          }[turn.persona]
        : intros[turn.persona]);
  const eligibleIngredients = new Set(eligible.flatMap(({ fromPantry }) =>
    fromPantry.map(({ name }) => canonicalIngredient(name)),
  ));
  const unavailablePantry = [...new Set(pantry
    .filter(({ name }) => !eligibleIngredients.has(canonicalIngredient(name)))
    .map(({ name }) => ingredientEnglish(name)))];
  const pantryNote = unavailablePantry.length
    ? ` The catalog has no qualifying option that uses ${englishList.format(unavailablePantry)} under these conditions.`
    : swap && pantry.length && cards.every((card) => pantryMatchCount(card) === 0)
      ? " The remaining alternatives use different ingredients. Check the shopping list before choosing."
      : "";
  return {
    ...reply,
    cards,
    message: `${count}${detail}${pantryNote}${allergyNote}`,
    unknowns,
    responseType:
      shopping || turn.persona === "family"
        ? "shopping_summary"
        : "meal_candidates",
  };
}

export async function planTurn(
  turn: Turn,
  rank?: RankMeals,
): Promise<ChatReply> {
  const reply = await plan(turn, rank);
  return turn.language === "en"
    ? {
        ...reply,
        context: englishContext(reply.context),
        cards: reply.cards.map(englishCard),
      }
    : reply;
}
