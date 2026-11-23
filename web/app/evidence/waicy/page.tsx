import type { Metadata } from "next";
import Link from "next/link";
import record from "./record.json";

export const metadata: Metadata = {
  title: "CareKitchen · WAICY 2026 Demo & Transcript",
  description:
    "使用合成情境重跑的 CareKitchen 十輪對話，含模型資訊與規則回應。",
};

const englishRecap: Record<string, string> = {
  "DEMO-10-1": "The user has tofu, greens, two eggs and NT$100 for one dinner. The assistant asks which equipment is available.",
  "DEMO-10-2": "With only a rice cooker, the user asks for two choices. The assistant suggests tofu with greens and steamed tofu with egg.",
  "DEMO-10-3": "The user excludes eggs. The two choices become tofu with greens and steamed tofu with mushrooms.",
  "DEMO-10-4": "The user changes to two servings and NT$80. Both options are recalculated using the rice cooker and egg exclusion.",
  "DEMO-10-5": "The user quotes NT$45 for a 300 g package of tofu and NT$60 for 500 g of rice. The known purchase subtotal for each option is NT$45.",
  "DEMO-10-6": "The user asks if NT$80 is enough. The assistant cannot confirm the total because greens or mushrooms still lack prices.",
  "DEMO-10-7": "The user switches to a microwave and prefers a moist dish. The assistant offers microwave tofu with greens or tofu with eggplant.",
  "DEMO-10-8": "The user mentions an unclear dietary restriction. The assistant asks them to confirm the ingredient to exclude and shows no meal cards.",
  "DEMO-10-9": "The user asks for a guarantee involving medication. The assistant refers the question to a healthcare professional and shows no meal cards.",
  "DEMO-10-10": "The user confirms the egg exclusion in the form and asks for shopping help. Both options retain the microwave and two servings, with NT$45 known and the remaining prices flagged.",
};

export default function WaicyEvidence() {
  return (
    <main className="evidence-page">
      <Link className="text-link" href="/">
        返回 CareKitchen
      </Link>
      <header className="evidence-header">
        <p lang="en">WAICY 2026 · CareKitchen</p>
        <h1>十輪備餐對話實測</h1>
        <p lang="en">
          A recorded synthetic meal-planning session, with live OpenAI calls and
          server-side checks.
        </p>
        <dl className="evidence-facts">
          <div>
            <dt>問答回合</dt>
            <dd>{record.turns.length}</dd>
          </div>
          <div>
            <dt>模型請求</dt>
            <dd>{record.turns.filter(({ model }) => Boolean(model)).length}</dd>
          </div>
          <div>
            <dt>版本</dt>
            <dd>{record.promptVersion}</dd>
          </div>
        </dl>
        <p className="conversation-role">
          執行時間 <time dateTime={record.executedAt}>{record.executedAt}</time>
          。輸入為合成案例。逐輪標示模型參與與程式檢查。
        </p>
      </header>
      <details className="judge-guide" lang="en">
        <summary>Try the live planner · English guide</summary>
        <ol>
          <li>
            <Link href="/#workspace" target="_blank" rel="noopener">
              Open CareKitchen in a new tab
            </Link>
            . In the chat, select <span lang="zh-Hant">試試看一個例子</span>{" "}
            (Load an example), then <span lang="zh-Hant">送出</span> (Send).
            The example plans dinner for one with tofu, greens and a rice
            cooker, with a budget of NT$100.
          </li>
          <li>
            Paste this follow-up in the same chat and send it. It asks for two
            servings, NT$80 and no eggs.
            <blockquote lang="zh-Hant">
              改成兩人份，預算 80 元，不要蛋，其他照舊。
            </blockquote>
          </li>
          <li>
            Look for <span lang="zh-Hant">兩人份／2 人份</span> (two servings)
            and <span lang="zh-Hant">排除 蛋</span> (exclude eggs). Follow{" "}
            <span lang="zh-Hant">查看餐點</span> (View meals) to compare the
            options and price status. <a href="#round-6">See the recorded budget check</a>.
          </li>
        </ol>
      </details>
      <ol className="evidence-turns">
        {record.turns.map((turn, index) => (
          <li key={turn.id}>
            <article aria-labelledby={`round-${index + 1}`}>
              <div className="evidence-turn-heading">
                <h2 id={`round-${index + 1}`}>第 {index + 1} 輪</h2>
                <span>
                  {turn.model ? `${turn.model} 與程式檢查` : "程式檢查"}
                </span>
              </div>
              <p className="evidence-recap" lang="en">
                {englishRecap[turn.id]}
              </p>
              {turn.formNote && (
                <p className="evidence-form-note">{turn.formNote}</p>
              )}
              <dl>
                <div>
                  <dt>使用者</dt>
                  <dd>{turn.input}</dd>
                </div>
                <div>
                  <dt>CareKitchen</dt>
                  <dd>{turn.reply}</dd>
                </div>
                {turn.meals.length > 0 && (
                  <div>
                    <dt>建議餐點</dt>
                    <dd>
                      <ul>
                        {turn.meals.map((meal) => (
                          <li key={meal.id}>
                            {meal.title} · {meal.servings} 人份 ·{" "}
                            {meal.unknowns.length > 0 && meal.knownCostTwd === 0
                              ? "採買總額待確認"
                              : `已知新增採買 NT$ ${meal.knownCostTwd}`}
                            {meal.unknowns.length > 0 &&
                              ` · ${meal.unknowns.join("、")}價格待確認`}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          </li>
        ))}
      </ol>
    </main>
  );
}
