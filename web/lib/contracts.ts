export const personas = ["elder", "caregiver", "family"] as const;
export const units = ["g", "ml", "個", "份"] as const;
export const equipmentOptions = [
  "rice_cooker",
  "microwave",
  "stove",
  "no_cook",
] as const;

export type Persona = (typeof personas)[number];
export type Unit = (typeof units)[number];
export type Equipment = (typeof equipmentOptions)[number];
export type ChatMode = "openai" | "local" | "unavailable";

export const personaLabels: Record<Persona, string> = {
  elder: "Cooking for myself",
  caregiver: "Cooking for someone I care for",
  family: "Planning with family",
};

export const equipmentLabels: Record<Equipment, string> = {
  rice_cooker: "Rice cooker",
  microwave: "Microwave",
  stove: "Stovetop",
  no_cook: "No-cook",
};

export type ItemAmount = {
  name: string;
  quantity: number | null;
  unit: Unit | null;
};
export type PriceQuote = {
  name: string;
  quantity: number;
  unit: Unit;
  priceTwd: number;
};

export type MealContext = {
  servings: number | null;
  mealCount: number;
  budgetTwd: number | null;
  pantryItems: ItemAmount[];
  purchasePrices: PriceQuote[];
  excludedIngredients: string[];
  equipment: Equipment[];
  maxTimeMinutes: number | null;
  preferences: string[];
  uncertainty: boolean;
  onlyPantry: boolean;
};

export const emptyContext: MealContext = {
  servings: null,
  mealCount: 1,
  budgetTwd: null,
  pantryItems: [],
  purchasePrices: [],
  excludedIngredients: [],
  equipment: [],
  maxTimeMinutes: null,
  preferences: [],
  uncertainty: false,
  onlyPantry: false,
};

export type MealCard = {
  id: string;
  title: string;
  servings: number;
  mealCount: number;
  equipment: Equipment;
  minutes: number;
  fromPantry: ItemAmount[];
  toBuy: Array<ItemAmount & { priceTwd: number | null }>;
  knownCostTwd: number;
  budgetStatus: "within" | "over" | "unknown" | "no_budget";
  missingPrices: string[];
  unknownPantry: string[];
  steps: string[];
  reason?: string;
};

export type ChatReply = {
  mode: Exclude<ChatMode, "unavailable">;
  message: string;
  context: MealContext;
  cards: MealCard[];
  responseType:
    | "ask_clarification"
    | "meal_candidates"
    | "shopping_summary"
    | "professional_referral";
  unknowns: string[];
  modelInfo?: { model: string; promptVersion: string };
};
