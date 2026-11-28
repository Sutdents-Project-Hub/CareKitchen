import type { Metadata } from "next";
import Link from "next/link";
import record from "./record.json";

export const metadata: Metadata = {
  title: "CareKitchen | WAICY 2026 demo and transcript",
  description: "A ten-round English browser session with the deployed assistant, operated by Codex with fictional meal-planning inputs.",
};

const modelRounds = record.turns.filter((turn) => turn.model).length;

export default function WaicyEvidence() {
  return (
    <main className="evidence-page">
      <Link className="text-link" href="/">
        Back to CareKitchen
      </Link>
      <header className="evidence-header">
        <p>WAICY 2026 · CareKitchen</p>
        <h1>Ten rounds of meal planning</h1>
        <p>Codex operated the deployed English assistant in a browser using fictional meal-planning inputs.</p>
        <dl className="evidence-facts">
          <div>
            <dt>Conversation rounds</dt>
            <dd>{record.turns.length}</dd>
          </div>
          <div>
            <dt>Rounds with a model decision</dt>
            <dd>{modelRounds}</dd>
          </div>
          <div>
            <dt>Prompt version</dt>
            <dd>{record.promptVersion}</dd>
          </div>
        </dl>
        <p className="conversation-role">
          Recorded <time dateTime={record.executedAt}>{record.executedAt.slice(0, 10)} UTC</time>.
          Each round identifies whether the model participated.
        </p>
      </header>
      <details className="judge-guide">
        <summary>Try the live assistant</summary>
        <ol>
          <li>
            <Link href="/#workspace" target="_blank" rel="noopener">Open CareKitchen in a new tab.</Link>{" "}
            Choose “Cooking for myself” and send “Dinner for 1”.
          </li>
          <li>
            Send this update in the same conversation.
            <blockquote>Make it for 2 people, with a budget of NT$80 and no eggs. Keep everything else.</blockquote>
          </li>
          <li>
            Check that the meal cards use two servings and keep the rice cooker and egg exclusion.
            {" "}<a href="#round-6">Read how the recorded session handles a missing price.</a>
          </li>
        </ol>
      </details>
      <ol className="evidence-turns">
        {record.turns.map((turn, index) => (
          <li key={turn.id}>
            <article aria-labelledby={`round-${index + 1}`}>
              <div className="evidence-turn-heading">
                <h2 id={`round-${index + 1}`}>Round {index + 1}</h2>
                <span>{turn.model ? `${turn.model} and server checks` : "Server checks"}</span>
              </div>
              <dl>
                <div>
                  <dt>User</dt>
                  <dd>{turn.input}</dd>
                </div>
                <div>
                  <dt>CareKitchen</dt>
                  <dd>{turn.reply}</dd>
                </div>
                {turn.meals.length > 0 && (
                  <div>
                    <dt>Meal options</dt>
                    <dd>
                      <ul>
                        {turn.meals.map((meal) => (
                          <li key={meal.id}>
                            {meal.title} · {meal.servings} {meal.servings === 1 ? "serving" : "servings"} ·{" "}
                            {(meal.missingPrices.length > 0 || meal.unknownPantry.length > 0) && meal.knownCostTwd === 0
                              ? "Shopping total pending"
                              : `Known shopping subtotal NT$${meal.knownCostTwd}`}
                            {meal.missingPrices.length > 0 && ` · Prices to confirm for ${meal.missingPrices.join(", ")}`}
                            {meal.unknownPantry.length > 0 && ` · Pantry amounts to confirm for ${meal.unknownPantry.join(", ")}`}
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
