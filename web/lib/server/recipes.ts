import type { Equipment, ItemAmount } from "../contracts.ts";

export type Recipe = {
  id: string;
  title: string;
  equipment: Equipment;
  minutes: number;
  ingredients: Array<
    ItemAmount & { quantity: number; unit: NonNullable<ItemAmount["unit"]> }
  >;
  steps: string[];
};
const g = (name: string, quantity: number): Recipe["ingredients"][number] => ({
  name,
  quantity,
  unit: "g",
});
const egg = { name: "雞蛋", quantity: 1, unit: "個" } as const;
const steam = [
  "食材洗淨、切小塊，放入耐熱容器；電鍋外鍋依設備說明加入飲用水。",
  "蒸至食材熟透；開蓋避開蒸氣，確認中心熱透後再食用。",
];
const microwave = [
  "食材洗淨、切小塊，放入微波專用容器，加少量飲用水並以可排氣的蓋子覆蓋。",
  "分段微波，中途攪拌或翻面，確認食材熟透且中心熱透；依份量及設備調整時間，避免燙傷。",
];
const boil = [
  "食材洗淨、切小塊，鍋內加入足以烹煮的飲用水並煮滾。",
  "放入食材煮至熟透，確認中心熱透後撈起；取鍋時小心熱水與蒸氣。",
];
function veg(
  id: string,
  title: string,
  equipment: Equipment,
  minutes: number,
  ingredients: Recipe["ingredients"],
): Recipe {
  return {
    id,
    title,
    equipment,
    minutes,
    ingredients,
    steps:
      equipment === "rice_cooker"
        ? [...steam]
        : equipment === "microwave"
          ? [...microwave]
          : [...boil],
  };
}

// Original demonstration recipes, not medical or allergy-safety certifications.
// Drinking water used for cooking/steaming is disclosed as a kitchen utility.
// No salt, oil, sauces or optional ingredients are silently added.
export const RECIPES: readonly Recipe[] = [
  veg("steam-tofu-greens", "電鍋豆腐青菜", "rice_cooker", 25, [
    g("豆腐", 150),
    g("青菜", 120),
  ]),
  veg("steam-pumpkin-tofu", "南瓜蒸豆腐", "rice_cooker", 30, [
    g("南瓜", 150),
    g("豆腐", 150),
  ]),
  veg("steam-cabbage-carrot", "高麗菜蒸紅蘿蔔", "rice_cooker", 25, [
    g("高麗菜", 150),
    g("紅蘿蔔", 60),
  ]),
  veg("steam-sweet-potato", "蒸地瓜", "rice_cooker", 35, [g("地瓜", 200)]),
  veg("steam-mushroom-tofu", "菇菇蒸豆腐", "rice_cooker", 25, [
    g("菇類", 80),
    g("豆腐", 150),
  ]),
  {
    id: "steam-egg-tofu",
    title: "豆腐蒸蛋",
    equipment: "rice_cooker",
    minutes: 30,
    ingredients: [egg, g("豆腐", 100)],
    steps: [
      "雞蛋打散，加入與蛋液約等量的飲用水；豆腐切小塊，一起放入耐熱碗。接觸生蛋後洗手並清潔器具。",
      "電鍋外鍋依設備說明加飲用水，將碗放入蒸煮；蒸至蛋液完全凝固、中心熟透，未熟則續蒸。",
      "取出時避開蒸氣，稍放涼後食用。",
    ],
  },
  veg("micro-tofu-greens", "微波豆腐青菜", "microwave", 15, [
    g("豆腐", 150),
    g("青菜", 120),
  ]),
  veg("micro-pumpkin", "微波南瓜", "microwave", 20, [g("南瓜", 200)]),
  veg("micro-cabbage", "微波高麗菜", "microwave", 15, [g("高麗菜", 180)]),
  veg("micro-potato-carrot", "馬鈴薯紅蘿蔔", "microwave", 25, [
    g("馬鈴薯", 150),
    g("紅蘿蔔", 60),
  ]),
  veg("micro-eggplant-tofu", "茄子豆腐", "microwave", 20, [
    g("茄子", 120),
    g("豆腐", 150),
  ]),
  veg("boil-greens-tofu", "青菜豆腐煮", "stove", 20, [
    g("青菜", 120),
    g("豆腐", 150),
  ]),
  veg("boil-cabbage-mushroom", "高麗菜菇菇煮", "stove", 20, [
    g("高麗菜", 150),
    g("菇類", 80),
  ]),
  veg("boil-broccoli-carrot", "花椰菜紅蘿蔔", "stove", 20, [
    g("花椰菜", 150),
    g("紅蘿蔔", 60),
  ]),
  veg("boil-pumpkin-tofu", "南瓜豆腐煮", "stove", 25, [
    g("南瓜", 150),
    g("豆腐", 150),
  ]),
  {
    id: "stove-egg-tomato",
    title: "番茄煮蛋",
    equipment: "stove",
    minutes: 20,
    ingredients: [egg, g("番茄", 150)],
    steps: [
      "將番茄用流動飲用水洗淨切小塊。把雞蛋打入碗中打散，接觸生蛋後洗手並清潔器具。",
      "將番茄和少量飲用水放入鍋中煮軟，倒入蛋液並輕輕攪拌。",
      "煮至蛋液完全凝固、沒有流動蛋液，再用乾淨器具盛出。",
    ],
  },
  {
    id: "boil-egg",
    title: "水煮蛋",
    equipment: "stove",
    minutes: 20,
    ingredients: [egg],
    steps: [
      "雞蛋檢查外殼完整，放入鍋中，加入蓋過蛋的飲用水。接觸生蛋後洗手。",
      "煮滾後持續烹煮至蛋白、蛋黃完全凝固；勿將時間當成熟透保證。",
      "用乾淨器具取出，稍放涼後剝殼，切開確認已熟透。",
    ],
  },
  {
    id: "steam-rice",
    title: "電鍋白飯",
    equipment: "rice_cooker",
    minutes: 40,
    ingredients: [g("白米", 75)],
    steps: [
      "白米洗淨放入內鍋；依米包裝與電鍋說明加入飲用水，外鍋也依說明加水。",
      "按設備說明煮飯並燜至米粒熟透；依總份量分批煮，勿超過容量。",
      "用乾淨飯匙盛取，趁熱食用；不要長時間放在室溫。",
    ],
  },
  {
    id: "raw-cucumber-tomato",
    title: "小黃瓜番茄盤",
    equipment: "no_cook",
    minutes: 10,
    ingredients: [g("小黃瓜", 100), g("番茄", 120)],
    steps: [
      "使用適合生食且新鮮完整的食材；以流動飲用水洗淨。",
      "用乾淨的刀與砧板切成方便入口的小塊，不加入未列出的醬料。",
      "現切現吃；食材來源或生食限制不明時，先確認再選用。",
    ],
  },
  {
    id: "raw-tomato",
    title: "鮮切番茄",
    equipment: "no_cook",
    minutes: 5,
    ingredients: [g("番茄", 180)],
    steps: [
      "選適合生食的新鮮番茄，以流動飲用水洗淨。",
      "用乾淨刀具去蒂切小塊，現切現吃；生食限制不明時先確認。",
    ],
  },
  veg("steam-potato", "電鍋蒸馬鈴薯", "rice_cooker", 35, [g("馬鈴薯", 200)]),
];
