import type { Metadata } from "next";
import Link from "next/link";
import record from "./record.json";

export const metadata: Metadata = {
  title: "CareKitchen · WAICY 2026 對話紀錄",
  description:
    "使用合成情境重跑的 CareKitchen 十輪對話，含模型資訊與規則回應。",
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
                            {meal.title} · {meal.servings} 人份 · 已知新增採買
                            NT$ {meal.knownCostTwd}
                            {meal.unknowns.length > 0
                              ? ` · ${meal.unknowns.join("、")}待確認`
                              : ""}
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
