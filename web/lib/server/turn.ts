import { z } from "zod";
import {
  equipmentOptions,
  personas,
  units,
  type Equipment,
  type ItemAmount,
  type MealContext,
  type Unit,
} from "../contracts.ts";

const name = z.string().trim().min(1).max(32);
const quantity = z.number().positive().max(10_000);
const amount = z.number().min(0).max(1_000_000).refine((value) =>
  Math.abs(value * 100 - Math.round(value * 100)) < 0.000001,
);

export const contextSchema = z.object({
  servings: z.number().int().min(1).max(12).nullable(),
  mealCount: z.number().int().min(1).max(7),
  budgetTwd: amount.nullable(),
  pantryItems: z.array(z.object({
    name,
    quantity: quantity.nullable(),
    unit: z.enum(units).nullable(),
  }).refine((item) => (item.quantity === null) === (item.unit === null))).max(30),
  purchasePrices: z.array(z.object({
    name,
    quantity,
    unit: z.enum(units),
    priceTwd: amount,
  })).max(30),
  excludedIngredients: z.array(name).max(24),
  equipment: z.array(z.enum(equipmentOptions)).max(equipmentOptions.length),
  maxTimeMinutes: z.number().int().min(1).max(360).nullable(),
  preferences: z.array(name).max(16),
  uncertainty: z.boolean(),
  onlyPantry: z.boolean(),
});

export const turnSchema = z.object({
  persona: z.enum(personas),
  text: z.string().trim().min(1).max(600),
  context: contextSchema,
  previousMealIds: z.array(z.string().max(64)).max(30).default([]),
});

export type Turn = z.infer<typeof turnSchema>;
export type Intent = "plan" | "swap" | "shopping" | "clarify" | "refer";

const chineseDigits = "零一二三四五六七八九";
const smallNumber = "[0-9]{1,3}|[零一二兩三四五六七八九十]{1,3}";
const matchingEquipment: Array<[RegExp, Equipment]> = [
  [/電鍋|電子鍋/, "rice_cooker"],
  [/微波爐|微波/, "microwave"],
  [/瓦斯爐|瓦斯|電磁爐|電爐|爐具|爐子|平底鍋/, "stove"],
  [/免開火|不用開火|冷食/, "no_cook"],
];
const medicalPattern = /用藥|吃藥|服藥|服用|藥物|藥品|藥師|調藥|停藥|藥量|降血糖藥|降壓藥|處方|劑量|診斷|治療|吞嚥|醫療安全|營養處方|腎臟病|糖尿病|高血壓|化療/;
const uncertainPattern = /(?:好像|不確定|忘了|有些|有某些).{0,16}(?:不能吃|忌口|限制|過敏)|有(?:飲食|食物|食材)?(?:限制|過敏|忌口)|(?:醫師|醫生|我過敏)(?:[。！?？]|$)/;
const identifierPattern = /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b09\d{2}[- ]?\d{3}[- ]?\d{3}\b|[A-Z][12]\d{8}/i;
const foodSeparator = /、|，|,|和|跟|與|以及|及|\+/;
const amountUnits = { g: "g", 克: "g", 公克: "g", ml: "ml", 毫升: "ml", 個: "個", 份: "份" } as const;

function parseInteger(value: string) {
  if (/^\d+$/.test(value)) return Number(value);
  const normalized = value.replace(/兩/g, "二");
  if (!normalized.includes("十")) return chineseDigits.indexOf(normalized);
  const [tens, ones] = normalized.split("十");
  return (tens ? chineseDigits.indexOf(tens) : 1) * 10
    + (ones ? chineseDigits.indexOf(ones) : 0);
}

function latestNumber(text: string, expression: string, max: number) {
  const matches = [...text.matchAll(new RegExp(expression, "g"))];
  const match = matches.at(-1);
  if (!match) return null;
  const value = parseInteger(match[1]);
  return value > 0 && value <= max ? value : undefined;
}

function foodList(value: string) {
  return value.split(foodSeparator)
    .map((part) => part.trim().replace(/^(?:還有|一些|一點)/, ""))
    .filter((part) => /^[\p{Script=Han}A-Za-z]{1,16}$/u.test(part))
    .filter((part) => !/^(?:火|開火|明火|瓦斯|買|再買|採買|烹調|什麼|食材|東西|某些東西|其他|換|這道|它)$/.test(part));
}

function pantryAmount(value: string): ItemAmount | null {
  const match = value.trim().match(/^([\p{Script=Han}A-Za-z]{1,16})\s*(\d{1,5}(?:\.\d{1,2})?)\s*(公克|克|毫升|ml|g|個|份)$/iu);
  if (match && Number(match[2]) > 0 && Number(match[2]) <= 10_000) {
    const unit = amountUnits[match[3].toLowerCase() as keyof typeof amountUnits];
    return { name: match[1], quantity: Number(match[2]), unit: unit as Unit };
  }
  const [name] = foodList(value);
  return name ? { name, quantity: null, unit: null } : null;
}

function sameName(a: string, b: string) {
  return a.normalize("NFKC").toLowerCase() === b.normalize("NFKC").toLowerCase();
}

export function inspectTurn(text: string, context: MealContext) {
  const normalized = text.normalize("NFKC");
  if (medicalPattern.test(normalized)) return { context, intent: "refer" as const };
  if (identifierPattern.test(normalized) || identifierPattern.test(JSON.stringify(context))) {
    return { context, intent: "clarify" as const, question: "請從訊息和條件中移除聯絡方式或證件資料，再告訴我想怎麼安排這餐。" };
  }

  const updated: MealContext = {
    ...context,
    pantryItems: [...context.pantryItems],
    excludedIngredients: [...context.excludedIngredients],
    preferences: [...context.preferences],
  };

  const servings = latestNumber(normalized, `(?<![0-9.${chineseDigits}兩十])(${smallNumber})\\s*(?:人份|個人|人(?=吃|用餐|享用|$|[,，。 、]))`, 12);
  const meals = latestNumber(normalized, `(?<![0-9.${chineseDigits}兩十])(${smallNumber})\\s*餐(?:份|量|的量)?(?![廳點])`, 7);
  const minutes = latestNumber(normalized, `(?<![0-9.${chineseDigits}兩十])(${smallNumber})\\s*分鐘`, 360);
  if ([servings, meals, minutes].includes(undefined)) {
    return { context, intent: "clarify" as const, question: "請在「這餐的條件」確認份數與料理時間。可填 1 到 12 人、1 到 7 餐及最多 360 分鐘。" };
  }
  updated.servings = servings ?? (/我自己(?:吃|用餐)|只煮給自己/.test(normalized) ? 1 : context.servings);
  updated.mealCount = meals ?? context.mealCount;
  updated.maxTimeMinutes = minutes ?? context.maxTimeMinutes;

  const explicitBudget = [...normalized.matchAll(/(?:預算|餐費)\s*(?:改(?:成|為)?|是|為|剩|只有|上限|約|控制在|不超過|最多|在)?\s*[:：]?\s*(?:新台幣|NT\$|\$)?\s*(\d{1,7}(?:\.\d{1,2})?)(?![\d.])\s*(?:元|塊|(?=$|[,，。、 ]))/gi)].at(-1);
  const budgetCeiling = normalized.match(/(?:^|最多|剩下|只有|大概有|有)(?:新台幣|NT\$|\$)?\s*(\d{1,7}(?:\.\d{1,2})?)\s*(?:元|塊)/i)
    ?? normalized.match(/(?:^|[,，。 、\s])(?:新台幣|NT\$|\$)?\s*(\d{1,7}(?:\.\d{1,2})?)\s*(?:元|塊)(?:以內|內)/i);
  const chineseBudget = normalized.match(/(?:預算|餐費)(?:改(?:成|為)?|是|為|剩|只有|上限|約)?\s*[:：]?\s*([零一二兩三四五六七八九十]{1,3})\s*(?:元|塊)/);
  const budgetValue = explicitBudget?.[1] ?? budgetCeiling?.[1] ?? (chineseBudget ? parseInteger(chineseBudget[1]) : undefined);
  if (budgetValue !== undefined && Number(budgetValue) >= 0 && Number(budgetValue) <= 1_000_000) {
    updated.budgetTwd = Number(budgetValue);
  }
  if ((/預算(?:改|上限|是|為|[:：])|餐費(?:改|上限|是|為|[:：])/.test(normalized) && budgetValue === undefined)
      || (budgetValue === undefined && /(?:預算|餐費)[^,。]{0,10}(?:\d|[一二兩三四五六七八九十百千]+\s*(?:元|塊))|美金|美元|日幣|人民幣|港幣/.test(normalized))
      || (budgetValue !== undefined && (Number(budgetValue) > 1_000_000 || Number(budgetValue) < 0))) {
    return { context: updated, intent: "clarify" as const, question: "請在「這餐的條件」填寫以新台幣計算的採買預算，金額可留白。" };
  }

  const clauses = normalized.split(/[,，。；;!?！？\n]/).flatMap((clause) =>
    /(?:不要|不吃|不能吃|不加|排除).+(?:也|然後|另外)(?=不要|不吃|不能|不加|排除)/.test(clause)
      ? clause.split(/(?:也|然後|另外)(?=不要|不吃|不能|不加|排除)/)
      : [clause],
  );
  const selected = new Set(updated.equipment);
  for (const clause of clauses.flatMap((part) => part.split(/但是|但|只好|改成(?=用)|(?=改用)/))) {
    const found = matchingEquipment.flatMap(([pattern, option]) => {
      const match = pattern.exec(clause);
      return match ? [{ index: match.index, end: match.index + match[0].length, option }] : [];
    }).sort((a, b) => a.index - b.index);
    if (/不要開火|不能開火|不能用明火|不可明火/.test(clause)) {
      selected.delete("stove");
      selected.add("no_cook");
    }
    if (found.length && /只有|只剩|僅有|只(?:能)?用|改用|不用開火|免開火/.test(clause)) {
      selected.clear();
    }
    let previousEnd = 0;
    let excluded = false;
    for (const match of found) {
      const prefix = clause.slice(previousEnd, match.index).trim();
      const suffix = clause.slice(match.end);
      excluded = /都(?:不能用|不可用|壞了|沒辦法用)$/.test(clause)
        || /(?:沒(?:有)?|不能(?:使用|用)?|別用|不要(?:使用|用)?|不用|不可(?:使用|用)?|沒有可用的)\s*$/.test(prefix)
        || (excluded && /^(?:、|和|與|跟|以及|及|或)$/.test(prefix))
        || /^(?:也|都)?(?:不能用|不可用|壞了|沒辦法用)/.test(suffix);
      if (excluded) selected.delete(match.option);
      else selected.add(match.option);
      previousEnd = match.end;
    }
  }
  updated.equipment = [...selected];

  if (/可以(?:再)?採買|可以(?:再)?買|能(?:再)?買/.test(normalized)) updated.onlyPantry = false;
  if (/只(?:想|能)?用(?:家裡|現有|手邊)|不要(?:再)?買|不用(?:再)?買|不想(?:再)?買|免採買/.test(normalized)) updated.onlyPantry = true;

  for (const clause of clauses) {
    const pantry = clause.match(/(?:家(?:裡)?(?:還|只)?有|我(?:還|只)?有|手邊(?:還|只)?有|食材(?:有|是|[:：])|只剩)\s*(.+)$/);
    if (pantry) {
      const parts = pantry[1].split(foodSeparator);
      const items = parts.map(pantryAmount).filter((item) => item !== null)
        .filter((item) => !matchingEquipment.some(([pattern]) => pattern.test(item.name))
        && !/預算|時間|人份|食譜|忌口|限制/.test(item.name));
      if (items.length && /只有|只剩/.test(clause) && !parts.some((part) => matchingEquipment.some(([pattern]) => pattern.test(part)))) {
        updated.pantryItems = updated.pantryItems.filter((item) => items.some((provided) => sameName(item.name, provided.name)));
      }
      for (const item of items) {
        const index = updated.pantryItems.findIndex((existing) => sameName(existing.name, item.name));
        if (index >= 0 && item.quantity !== null) updated.pantryItems[index] = item;
        if (index < 0 && updated.pantryItems.length < 30) {
          updated.pantryItems.push(item);
        }
      }
    }
    const explicit = clause.match(/(?:不要(?:用|吃)?|不能(?:用|吃)|不想吃|不吃|不加|避免|排除|禁用)\s*(.+)$/)
      ?? clause.match(/對\s*(.+?)過敏/)
      ?? clause.match(/^\s*(.{1,32}?)(?:也|都|不能|不要)(?:不能|不要)?(?:吃|用)?\s*$/);
    if (explicit && !/不要再?買|不要開火|不能開火|不能用明火|不可明火/.test(clause)) {
      const excluded = foodList(explicit[1].replace(/(?:改成|換成|改用|換成用).+$/, ""));
      for (const food of excluded) {
        if (matchingEquipment.some(([pattern]) => pattern.test(food))) continue;
        if (!updated.excludedIngredients.some((item) => sameName(item, food)) && updated.excludedIngredients.length < 24) {
          updated.excludedIngredients.push(food);
        }
      }
    }
    const preference = clause.match(/(?:喜歡|想吃|偏好)(.{1,16})$/);
    if (preference && !/不喜歡|不想吃/.test(clause) && updated.preferences.length < 16) {
      const value = preference[1].trim();
      if (value && !updated.preferences.includes(value)) updated.preferences.push(value);
    }
  }

  const hasUnknownRestriction = uncertainPattern.test(normalized)
    && !/沒有(?:任何)?(?:飲食|食物|食材)?(?:限制|過敏|忌口)/.test(normalized);
  const hasAllergyWithoutDetails = /過敏/.test(normalized)
    && !/對.{1,20}過敏|沒有(?:任何)?(?:食物|食材)?過敏/.test(normalized);
  if (hasUnknownRestriction || hasAllergyWithoutDetails) updated.uncertainty = true;
  if (updated.uncertainty) return { context: updated, intent: "clarify" as const, question: "請先確認需要排除的食材，再到「這餐的條件」填入，並取消勾選「有些條件不太確定」。" };

  if (/(?:食材|過敏|禁忌|忌口|不能吃|排除|禁用|不要吃|戒|禁食)/.test(normalized)
      && !/現有食材|利用食材|有哪些食材/.test(normalized)
      && !/用家裡|用手邊|用現有/.test(normalized)
      && !/整理|換食材/.test(normalized)
      && !updated.excludedIngredients.some((item) => normalized.includes(item))
      && !updated.pantryItems.some(({ name: item }) => normalized.includes(item))) {
    return { context: updated, intent: "clarify" as const, question: "如果有需要排除的食材，請直接告訴我名稱，或在「這餐的條件」填入。" };
  }
  if (/不要開火|不能開火|不可明火|不能用明火/.test(normalized)) {
    updated.equipment = updated.equipment.filter((option) => option !== "stove");
  }
  if (/油炸|氣炸|烤箱|烤雞|生食|半熟|生魚|生蛋|不熟|特殊飲食|嚴格素食/.test(normalized)) {
    return { context: updated, intent: "clarify" as const, question: "目前支援電鍋、微波爐、爐具或免開火的簡易餐點。請在「這餐的條件」確認可用設備和排除食材。" };
  }
  if (/不含|禁食|一定要|必須|僅限|清真|全素|純素|少於|不得|不可吃/.test(normalized)) {
    return { context: updated, intent: "clarify" as const, question: "這項要求需要先確認。請在「這餐的條件」填入必須排除的食材、可用設備或時間上限。" };
  }
  if (/解除|不用排除|取消排除|現在可以吃|可以放回/.test(normalized)) {
    return { context: updated, intent: "clarify" as const, question: "請在「這餐的條件」確認後移除排除食材，我會依更新的清單重算。" };
  }
  if (/(?:售價|單價|\d+\s*(?:元|塊)[^。]{0,12}(?:一|1)(?:包|盒|斤)|(?:每|一)(?:包|盒|斤)[^。]{0,10}\d+\s*(?:元|塊))/.test(normalized)
      || (budgetValue === undefined && /\d\s*(?:元|塊錢)/.test(normalized))) {
    return { context: updated, intent: "clarify" as const, question: "請把品項、包裝數量與總價填進「這餐的條件」的採買價格，我就能套用這筆報價。" };
  }
  if (/採買|購物|購買|清單|買什麼|買哪些/.test(normalized)) return { context: updated, intent: "shopping" as const };
  if (/換(?:一|個|道|別的|食材)|其他(?:餐點|選擇)|不喜歡這/.test(normalized)) return { context: updated, intent: "swap" as const };

  const changed = JSON.stringify(context) !== JSON.stringify(updated);
  if (changed || /餐|推薦|規劃|煮|料理|菜|預算|電鍋|爐|吃|做飯/.test(normalized)) {
    return { context: updated, intent: "plan" as const };
  }
  return { context: updated, intent: "clarify" as const };
}
