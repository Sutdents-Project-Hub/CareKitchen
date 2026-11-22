import type { ChatReply, MealCard, MealContext, Persona } from "../contracts.ts";
import { generateMeals } from "./meals.ts";
import { inspectTurn, type Turn } from "./turn.ts";

export type RankableMeal = Pick<MealCard, "id" | "title" | "minutes" | "missingPrices"> & {
  ingredients: string[];
};

export type Decision = {
  action: "keep" | "clarify" | "refer" | "shopping" | "swap";
  preferredIds: string[];
};

export type RankMeals = (
  turn: Pick<Turn, "persona" | "text" | "previousMealIds">,
  context: Pick<MealContext, "servings" | "mealCount" | "equipment" | "preferences" | "excludedIngredients">,
  options: RankableMeal[],
) => Promise<{ decision: Decision; modelInfo: NonNullable<ChatReply["modelInfo"]> }>;

const referral = "這項問題需要專業人員確認。用藥請問醫師或藥師，疾病飲食或吞嚥問題請向醫師或營養師確認。日常備餐時，您可以填入已確認要避開的食材。";

const intros: Record<Persona, string> = {
  elder: "您可以挑一道喜歡的，點開就能看簡單做法。",
  caregiver: "每道都按目前的人數、設備和排除食材重新檢查。請核對家中食材份量及包裝成分。",
  family: "每道都分出家裡已有和需要採買的項目。您可以在餐點卡預覽並複製給家人的摘要。",
};

function pickInOrder(cards: MealCard[], preferredIds: string[]) {
  const priority = [...new Set(preferredIds)];
  return [...cards].sort((a, b) => {
    const rankA = priority.indexOf(a.id);
    const rankB = priority.indexOf(b.id);
    return (rankA < 0 ? priority.length : rankA) - (rankB < 0 ? priority.length : rankB);
  });
}

export async function planTurn(turn: Turn, rank?: RankMeals): Promise<ChatReply> {
  const local = inspectTurn(turn.text, turn.context);
  const { context } = local;
  const reply: ChatReply = {
    context,
    cards: [],
    mode: rank ? "openai" : "local",
    message: "",
    responseType: "ask_clarification",
    unknowns: [],
  };
  if (local.intent === "refer") return { ...reply, message: referral, responseType: "professional_referral" };
  if (local.intent === "clarify" && local.question) return { ...reply, message: local.question };

  const readyToPlan = context.servings !== null && context.equipment.length > 0;
  const eligible = readyToPlan ? generateMeals(context) : [];
  const model = rank ? await rank(
    { persona: turn.persona, text: turn.text, previousMealIds: turn.previousMealIds },
    { servings: context.servings, mealCount: context.mealCount, equipment: context.equipment,
      preferences: context.preferences, excludedIngredients: context.excludedIngredients },
    eligible.map(({ id, title, minutes, fromPantry, toBuy, missingPrices }) => ({
      id, title, minutes, missingPrices, ingredients: [...fromPantry, ...toBuy].map(({ name }) => name),
    })),
  ) : undefined;
  if (model) reply.modelInfo = model.modelInfo;
  const decision = model?.decision;
  if (decision?.action === "refer") return { ...reply, message: referral, responseType: "professional_referral" };
  if (decision?.action === "clarify" || (local.intent === "clarify" && !decision)) {
    return { ...reply, message: "請告訴我這餐想用哪些食材、要煮給幾個人，或在「這餐的條件」逐項確認。" };
  }

  if (!readyToPlan) {
    const missing = [];
    if (context.servings === null) missing.push("份量（例如一人份）");
    if (!context.equipment.length) missing.push("設備（例如只有電鍋，或免開火）");
    return { ...reply, message: `這餐要怎麼準備？請先告訴我${missing.join("和")}。`, unknowns: missing };
  }

  const swap = local.intent === "swap" || decision?.action === "swap";
  const shopping = local.intent === "shopping" || decision?.action === "shopping";
  const candidates = swap ? eligible.filter(({ id }) => !turn.previousMealIds.includes(id)) : eligible;
  const cards = pickInOrder(candidates, decision?.preferredIds ?? []).slice(0, turn.persona === "elder" ? 2 : 3);

  if (cards.length === 0) {
    const message = swap && eligible.length > 0
      ? "目前符合這些條件的餐點都已列過了。調整可用食材、時間或設備後，我可以再找。"
      : "目前的餐點庫找不到符合這些條件的搭配。請核對排除食材、時間、設備和預算，再看看哪些條件能調整。";
    return { ...reply, message };
  }
  const missingPrices = [...new Set(cards.flatMap((card) => card.missingPrices))];
  const unknownPantry = [...new Set(cards.flatMap((card) => card.unknownPantry))];
  const unknowns = [
    ...(missingPrices.length ? [`採買價格待確認：${missingPrices.join("、")}`] : []),
    ...(unknownPantry.length ? [`家中份量待確認：${unknownPantry.join("、")}`] : []),
  ];
  const count = cards.length === 1 ? "目前有 1 道符合條件的方向。" : `依這一輪的條件找到 ${cards.length} 道餐點。`;
  const detail = shopping ? "請從下面選一道，查看待買項目與待確認價格，也可以預覽再複製採買摘要。" : intros[turn.persona];
  return {
    ...reply,
    cards,
    message: `${count}${detail}`,
    unknowns,
    responseType: shopping || turn.persona === "family" ? "shopping_summary" : "meal_candidates",
  };
}
