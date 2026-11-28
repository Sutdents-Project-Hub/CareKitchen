"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Copy,
  LoaderCircle,
  Minus,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import {
  emptyContext,
  equipmentLabels,
  personaLabels,
  units,
  type ChatMode,
  type ChatReply,
  type Equipment,
  type ItemAmount,
  type MealCard,
  type MealContext,
  type Persona,
  type Unit,
} from "../lib/contracts";

type Entry = { role: "assistant" | "user"; text: string; changes?: string[] };
const roles: Record<Persona, { title: string; line: string }> = {
  elder: { title: "Cooking for myself", line: "Find simple meals and easy steps" },
  caregiver: { title: "Cooking for someone I care for", line: "Plan portions and confirmed restrictions" },
  family: { title: "Planning with family", line: "Organize groceries for a shared plan" },
};
const roleOrder: Persona[] = ["elder", "caregiver", "family"];
const modeNames: Record<ChatMode, string> = {
  openai: "AI planner",
  local: "Local planner",
  unavailable: "Service unavailable",
};
const displayUnit = (unit: Unit | null) =>
  unit === "個" ? "ea" : unit === "份" ? "servings" : unit;
const split = (value: string) =>
  value
    .split(/[,，、\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
function parsePantry(value: string, previous: ItemAmount[]): ItemAmount[] {
  return split(value).map((raw) => {
    const match = raw.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(g|grams?|ml|milliliters?|個|份|ea|items?|pieces?|servings?)$/i);
    if (match) {
      const unit = match[3].toLowerCase();
      return {
        name: match[1].trim(),
        quantity: Number(match[2]),
        unit: /^(g|grams?)$/.test(unit) ? "g"
          : /^(ml|milliliters?)$/.test(unit) ? "ml"
          : /^(份|servings?)$/.test(unit) ? "份" : "個",
      };
    }
    const old = previous.find((item) => item.name === raw);
    return {
      name: raw,
      quantity: old?.quantity ?? null,
      unit: old?.unit ?? null,
    };
  });
}
const itemNames = (items: ItemAmount[]) =>
  items.map(
    (x) =>
      x.name + (x.quantity == null ? "" : ` ${x.quantity} ${displayUnit(x.unit)}`),
  );
const money = (value: number) => "NT$ " + value.toLocaleString("en-US");
const countLabel = (count: number, singular: string, plural = singular + "s") =>
  `${count} ${count === 1 ? singular : plural}`;

function conditionChanges(before: MealContext, after: MealContext) {
  const changes: string[] = [];
  if (before.servings !== after.servings && after.servings !== null) {
    changes.push(countLabel(after.servings, "serving"));
  }
  if (before.mealCount !== after.mealCount)
    changes.push(countLabel(after.mealCount, "meal"));
  if (before.budgetTwd !== after.budgetTwd && after.budgetTwd !== null) {
    changes.push(`Budget ${money(after.budgetTwd)}`);
  }
  if (before.equipment.join() !== after.equipment.join()) {
    changes.push(
      after.equipment.length
        ? after.equipment.map((item) => equipmentLabels[item]).join(", ")
        : "Equipment not specified",
    );
  }
  const exclusions = after.excludedIngredients.filter(
    (item) => !before.excludedIngredients.includes(item),
  );
  if (exclusions.length) changes.push(`Exclude ${exclusions.join(", ")}`);
  if (
    itemNames(before.pantryItems).join() !== itemNames(after.pantryItems).join()
  )
    changes.push("Updated available ingredients");
  if (
    JSON.stringify(before.purchasePrices) !==
    JSON.stringify(after.purchasePrices)
  )
    changes.push("Saved your price quotes");
  if (before.onlyPantry !== after.onlyPantry)
    changes.push(after.onlyPantry ? "Use available ingredients only" : "Can shop for ingredients");
  return changes;
}

function priceLabel(card: MealCard) {
  if (card.toBuy.length === 0 && card.unknownPantry.length === 0)
    return "No additional shopping needed";
  if (card.budgetStatus === "unknown") {
    const reason = card.missingPrices.length
      ? "Shopping total needs confirmation"
      : "Please confirm the amounts you have";
    return card.knownCostTwd > 0
      ? reason + " · Known subtotal: " + money(card.knownCostTwd)
      : reason;
  }
  if (card.budgetStatus === "within")
    return "Estimated from provided prices: " + money(card.knownCostTwd);
  if (card.budgetStatus === "over")
    return "Known shopping cost " + money(card.knownCostTwd) + " exceeds your budget";
  return "Known shopping cost " + money(card.knownCostTwd) + " · No budget set";
}

export default function CareKitchenApp() {
  const [persona, setPersona] = useState<Persona>("elder");
  const [context, setContext] = useState<MealContext>({ ...emptyContext });
  const [pantryText, setPantryText] = useState("");
  const [excludedText, setExcludedText] = useState("");
  const [preferencesText, setPreferencesText] = useState("");
  const [mode, setMode] = useState<ChatMode>("unavailable");
  const [modeReady, setModeReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [thread, setThread] = useState<Entry[]>([]);
  const [cards, setCards] = useState<MealCard[]>([]);
  const [answerContext, setAnswerContext] = useState<MealContext | null>(null);
  const [unknowns, setUnknowns] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [shareNotice, setShareNotice] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shareCard, setShareCard] = useState<MealCard | null>(null);
  const [retryRequest, setRetryRequest] = useState<{
    text: string;
    previousMealIds: string[];
  } | null>(null);
  const shareOpener = useRef<HTMLElement | null>(null);
  const shareDialog = useRef<HTMLElement>(null);
  const [priceName, setPriceName] = useState("");
  const [priceQty, setPriceQty] = useState("1");
  const [priceUnit, setPriceUnit] = useState<Unit>("份");
  const [priceValue, setPriceValue] = useState("");
  const current = Boolean(
    answerContext && JSON.stringify(answerContext) === JSON.stringify(context),
  );
  const activeCards = current ? cards : [];
  const keyConditions = [
    context.servings ? countLabel(context.servings, "person", "people") : "Serving size not set",
    countLabel(context.mealCount, "meal"),
    context.budgetTwd == null ? "Budget not set" : "Budget NT$ " + context.budgetTwd,
  ];
  if (context.equipment.length)
    keyConditions.push(
      context.equipment.map((item) => equipmentLabels[item]).join(", "),
    );
  if (context.excludedIngredients.length)
    keyConditions.push("Exclude " + context.excludedIngredients.join(", "));
  if (context.uncertainty) keyConditions.push("Dietary restrictions need confirmation");
  const summary = context.pantryItems.length
    ? [...keyConditions, itemNames(context.pantryItems).slice(0, 3).join(", ")]
    : keyConditions;

  useEffect(() => {
    let alive = true;
    fetch("/api/chat")
      .then(async (r) => {
        if (!r.ok) throw new Error("unavailable");
        const value = await r.json();
        if (alive && ["openai", "local", "unavailable"].includes(value.mode))
          setMode(value.mode as ChatMode);
      })
      .catch(() => {
        if (alive) setMode("unavailable");
      })
      .finally(() => {
        if (alive) setModeReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!shareCard) return;
    const dialog = shareDialog.current;
    const opener = shareOpener.current;
    const first = dialog?.querySelector<HTMLElement>("button");
    first?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShareCard(null);
      if (event.key !== "Tab" || !dialog) return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled)",
        ),
      );
      if (!controls.length) return;
      const firstControl = controls[0],
        lastControl = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [shareCard]);

  function edit(update: (old: MealContext) => MealContext) {
    if (busy) return;
    setContext(update);
    invalidateAnswer();
  }
  function invalidateAnswer() {
    setCards([]);
    setAnswerContext(null);
    setUnknowns([]);
    setExpanded(null);
    setNotice("");
    setShareNotice("");
    setRetryRequest(null);
  }
  function setField<K extends keyof MealContext>(
    key: K,
    value: MealContext[K],
  ) {
    edit((old) => ({ ...old, [key]: value }));
  }
  async function send(textValue = draft) {
    const text = textValue.trim();
    if (!text || busy) return;
    const retrying = retryRequest?.text === text;
    const previousMealIds = retrying
      ? retryRequest.previousMealIds
      : activeCards.map(({ id }) => id);
    setBusy(true);
    setNotice("");
    setShareNotice("");
    setRetryRequest({ text, previousMealIds });
    const submittedContext: MealContext = {
      ...context,
      pantryItems: parsePantry(pantryText, context.pantryItems),
      excludedIngredients: split(excludedText),
      preferences: split(preferencesText),
    };
    setContext(submittedContext);
    setCards([]);
    setAnswerContext(null);
    setUnknowns([]);
    if (!retrying) setThread((old) => [...old, { role: "user", text }]);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept-Language": "en" },
        body: JSON.stringify({
          language: "en",
          persona,
          text,
          context: submittedContext,
          ...(previousMealIds && previousMealIds.length
            ? { previousMealIds }
            : {}),
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (r.status === 503) setMode("unavailable");
        setNotice(
          typeof data?.message === "string"
            ? data.message
            : "We could not get a new suggestion. Your conditions and message are saved; please try again.",
        );
        setDraft(text);
        return;
      }
      const reply = data as ChatReply;
      if (reply.mode !== "openai" && reply.mode !== "local")
        throw new Error("Invalid meal planning response");
      setMode(reply.mode);
      setContext(reply.context);
      setAnswerContext(reply.context);
      setPantryText(itemNames(reply.context.pantryItems).join(", "));
      setExcludedText(reply.context.excludedIngredients.join(", "));
      setPreferencesText(reply.context.preferences.join(", "));
      setCards(reply.cards);
      setUnknowns(reply.unknowns || []);
      setThread((old) => [
        ...old,
        {
          role: "assistant",
          text: reply.message,
          changes: conditionChanges(submittedContext, reply.context),
        },
      ]);
      setDraft("");
      setExpanded(null);
      setRetryRequest(null);
    } catch {
      setNotice("We could not get a new suggestion. Your conditions and message are saved; please try again.");
      setMode("unavailable");
      setDraft(text);
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send();
  }
  function example() {
    if (busy) return;
    const exampleText =
      persona === "elder"
        ? "Plan a dinner for one. I have 150 g tofu and 120 g greens, a budget of NT$ 100, and a rice cooker."
        : persona === "caregiver"
          ? "Plan dinner for two. I have 300 g tofu and 240 g greens, a budget of NT$ 100, and a rice cooker. No eggs."
          : "Plan dinner for three. I have 150 g tofu and 120 g greens, a budget of NT$ 100, and a rice cooker. Include a shopping list.";
    setDraft(exampleText);
    document.getElementById("message")?.focus();
  }
  function toggleEquipment(item: Equipment) {
    setField(
      "equipment",
      context.equipment.includes(item)
        ? context.equipment.filter((x) => x !== item)
        : [...context.equipment, item],
    );
  }
  function addPrice() {
    const qty = Number(priceQty),
      value = Number(priceValue);
    if (
      !priceName.trim() ||
      !priceValue.trim() ||
      !Number.isFinite(qty) ||
      qty <= 0 ||
      !Number.isFinite(value) ||
      value < 0
    )
      return;
    const quote = {
      name: priceName.trim(),
      quantity: qty,
      unit: priceUnit,
      priceTwd: value,
    };
    setField("purchasePrices", [
      ...context.purchasePrices.filter((x) => x.name !== quote.name),
      quote,
    ]);
    setPriceName("");
    setPriceValue("");
  }
  function selectPersona(value: Persona) {
    if (busy) return;
    if (value !== persona) {
      setPersona(value);
      invalidateAnswer();
      setThread([]);
    }
    document.getElementById("workspace")?.scrollIntoView();
    document
      .getElementById("conversation-title")
      ?.focus({ preventScroll: true });
  }
  function choosePrompt(text: string) {
    if (busy) return;
    setDraft(text);
    document.getElementById("message")?.focus();
  }
  function shareLines(card: MealCard) {
    return [
      `Meal: ${card.title} (${countLabel(card.servings, "serving")} · ${countLabel(card.mealCount, "meal")})`,
      "Time: about " + card.minutes + " min · " + equipmentLabels[card.equipment],
      "Available at home: " + (itemNames(card.fromPantry).join(", ") || "To confirm"),
      "To buy: " +
        (card.toBuy.length
          ? card.toBuy
              .map(
                (x) =>
                  itemNames([x])[0] +
                  (x.priceTwd == null
                    ? " (price to confirm)"
                    : " (NT$ " + x.priceTwd + ")"),
              )
              .join(", ")
          : "None"),
      "Shopping cost: " + priceLabel(card),
      "Steps: ",
      ...card.steps.map((x, i) => i + 1 + ". " + x),
      "Please confirm any uncertain dietary restrictions with a qualified professional.",
    ];
  }
  async function copyShare() {
    if (!shareCard || !current) return;
    const c = shareCard;
    const lines = shareLines(c);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setShareNotice("Meal summary copied.");
      setShareCard(null);
    } catch {
      setShareNotice("Could not copy automatically. Select and copy the preview text.");
    }
  }

  return (
    <div id="top" className={"app-shell" + (largeText ? " large-text" : "")}>
      <a className="skip-link" href="#workspace">
        Skip to meal planner
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="CareKitchen home">
            CareKitchen
          </a>
          <nav className="top-links" aria-label="Main navigation">
            <a href="#workspace">Meal planner</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div className="access-tools" aria-label="Reading settings">
            <button
              type="button"
              className="text-tool"
              aria-pressed={simpleMode}
              onClick={() => setSimpleMode(!simpleMode)}
            >
              Simple steps
            </button>
            <button
              type="button"
              className="font-tool"
              aria-pressed={largeText}
              onClick={() => setLargeText(!largeText)}
            >
              {largeText ? "Smaller text" : "Larger text"}
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="entry-grid">
          <section className="hero" aria-labelledby="hero-heading">
            <h1 id="hero-heading">
              <span>Use what you have</span>
              <span>Plan a meal for today</span>
            </h1>
            <p>Find home-style meals based on your budget, equipment, and confirmed dietary restrictions.</p>
            <a className="button button-primary" href="#roles">
              Plan a meal <ArrowDown size={18} aria-hidden="true" />
            </a>
          </section>
          <section
            className="role-section"
            id="roles"
            tabIndex={-1}
            aria-labelledby="role-heading"
          >
            <h2 id="role-heading">Who are you cooking for?</h2>
            <div className="role-tabs" role="group" aria-label="Choose a planning scenario">
              {roleOrder.map((key) => (
                <button
                  key={key}
                  type="button"
                  className="role-tab"
                  onClick={() => selectPersona(key)}
                  disabled={busy}
                  aria-pressed={persona === key}
                >
                  <span className="role-text">
                    <strong>{roles[key].title}</strong>
                    <small>{roles[key].line}</small>
                  </span>
                  {persona === key ? (
                    <span className="role-current">Selected</span>
                  ) : (
                    <ArrowUpRight size={18} aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
          </section>
        </div>

        <section
          className="workspace-section"
          id="workspace"
          tabIndex={-1}
          aria-labelledby="workspace-title"
        >
          <div className="workspace-heading">
            <div>
              <h2 id="workspace-title">Meal planner</h2>
            </div>
            <div
              className={
                "connection-state" +
                (mode === "unavailable" ? " state-muted" : "")
              }
            >
              {modeReady ? modeNames[mode] : "Checking service…"}
            </div>
          </div>
          <div className="workspace-grid">
            <div className="planning-column">
              <section
                className="conversation-panel"
                id="conversation"
                aria-labelledby="conversation-title"
              >
                <div className="conversation-top">
                  <div className="panel-title">
                    <h3 id="conversation-title" tabIndex={-1}>
                      Meal planning chat
                    </h3>
                  </div>
                  <div className="conversation-tools">
                    <span className="conversation-role">
                      {personaLabels[persona]}
                    </span>
                    <a href="#meal-conditions" className="text-link">
                      Edit conditions
                    </a>
                  </div>
                </div>
                {(thread.length > 0 || context.servings !== null) && (
                  <p className="mobile-conditions">
                    {keyConditions.join(" · ")}
                  </p>
                )}
                {thread.length > 0 && (
                  <div
                    className="conversation-feed"
                    aria-live="polite"
                    aria-relevant="additions text"
                  >
                    {thread.map((entry, i) => (
                      <div className={"message-row " + entry.role} key={i}>
                        <div className="message-content">
                          <span className="message-author">
                            {entry.role === "assistant" ? "CareKitchen" : "You"}
                          </span>
                          <p>{entry.text}</p>
                          {Boolean(entry.changes?.length) && (
                            <p className="turn-changes">
                              Updated this turn · {entry.changes?.join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {busy && (
                      <div className="message-row assistant">
                        <div className="message-content">
                          <span className="message-author">CareKitchen</span>
                          <p className="thinking">
                            <LoaderCircle size={16} />
                            Planning with your current conditions…
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {notice && (
                  <div className="inline-notice" role="status">
                    <CircleAlert size={17} />
                    <span>{notice}</span>
                    {retryRequest && (
                      <button
                        type="button"
                        onClick={() => void send(retryRequest.text)}
                        disabled={busy || draft.trim() !== retryRequest.text}
                      >
                        Try again
                      </button>
                    )}
                  </div>
                )}
                <form className="composer" onSubmit={submit}>
                  <label className="composer-label" htmlFor="message">
                    Describe the meal you want to make
                  </label>
                  <textarea
                    id="message"
                    rows={2}
                    maxLength={600}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Example: I have tofu and greens. I want something simple…"
                    readOnly={busy}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        void send();
                      }
                    }}
                  />
                  <div className="composer-bottom">
                    <span>
                      {draft.length}/600 · Enter to send · Shift + Enter for a new line
                    </span>
                    <button
                      className="send-button"
                      type="submit"
                      disabled={busy || !draft.trim()}
                      aria-label="Send message"
                    >
                      {busy && (
                        <LoaderCircle
                          size={18}
                          className="spin"
                          aria-hidden="true"
                        />
                      )}
                      <span>{busy ? "Working…" : "Send"}</span>
                    </button>
                  </div>
                </form>
                {thread.length === 0 && (
                  <div className="conversation-start">
                    <button
                      className="example-prompt"
                      type="button"
                      onClick={example}
                    >
                      <span>
                        <strong>Try an example</strong>
                        <small>
                          {persona === "elder"
                            ? "1 serving · tofu and greens · NT$ 100"
                            : persona === "caregiver"
                              ? "Cooking for someone · include meal details"
                              : "3 servings · plan a shopping list"}
                        </small>
                      </span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </button>
                    <div className="quick-prompts" aria-label="Quick prompts">
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt("Plan a meal using ingredients I already have.")
                        }
                      >
                        Use what I have
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt(
                            "Plan within my budget and flag any prices that need confirmation.",
                          )
                        }
                      >
                        Plan within my budget
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt("Adjust the meal to exclude the ingredients I listed.")
                        }
                      >
                        Apply confirmed restrictions
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt(
                            "Make a shopping list for this meal with amounts and prices to confirm.",
                          )
                        }
                      >
                        Make a shopping list
                      </button>
                    </div>
                  </div>
                )}
                {activeCards.length > 0 && (
                  <a className="result-jump text-link" href="#meal-results">
                    View {activeCards.length} meal options{" "}
                    <ArrowDown size={16} aria-hidden="true" />
                  </a>
                )}
                <p className="conversation-privacy">
                  In AI mode, this turn’s message and meal-planning details are sent to OpenAI.
                </p>
              </section>
              <section
                className="results-section"
                id="meal-results"
                tabIndex={-1}
                aria-labelledby="results-title"
              >
                <div className="results-heading">
                  <h3 id="results-title" tabIndex={-1}>
                    Meal suggestions
                  </h3>
                  {activeCards.length > 0 && (
                    <button
                      className="text-action"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void send("Suggest another meal using my current details, avoiding the options already listed.")
                      }
                    >
                      <RefreshCw size={16} />
                      Try another meal
                    </button>
                  )}
                </div>
                {!activeCards.length ? (
                  <p className="results-empty">
                    {busy
                      ? "Checking this turn’s conditions."
                      : thread.length
                        ? "No meals to show yet."
                        : "Meal options will appear here after you send a request."}
                  </p>
                ) : (
                  <>
                    {context.servings !== null &&
                      (context.servings > 2 || context.mealCount > 1) && (
                        <p className="meal-batch-note">
                          {context.mealCount > 1
                            ? `Each option makes the same meal for ${context.mealCount} meals.`
                            : ""}
                          Heating time is estimated for batches of about 2 servings; actual batch size depends on your equipment.
                        </p>
                      )}
                    <div className="meal-grid">
                      {activeCards.slice(0, 3).map((card, i) => (
                        <MealOption
                          key={card.id}
                          card={card}
                          index={i}
                          expanded={expanded === card.id}
                          onToggle={() =>
                            setExpanded(expanded === card.id ? null : card.id)
                          }
                          onPreview={(button) => {
                            shareOpener.current = button;
                            setShareNotice("");
                            setShareCard(card);
                          }}
                          context={context}
                          simpleMode={simpleMode}
                          busy={busy}
                        />
                      ))}
                    </div>
                  </>
                )}
                {shareNotice && !shareCard && (
                  <p className="share-feedback" role="status">
                    {shareNotice}
                  </p>
                )}
                {unknowns.length > 0 && (
                  <div className="unknown-notes">
                    <strong>
                      <CircleAlert size={17} />
                      Needs confirmation
                    </strong>
                    <ul>
                      {unknowns.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>
            <aside
              className="conditions-panel"
              id="meal-conditions"
              tabIndex={-1}
              aria-labelledby="conditions-title"
            >
              <div className="panel-top">
                <h3 id="conditions-title" tabIndex={-1}>
                  Meal details
                </h3>
              </div>
              <p className="conditions-summary" aria-live="polite">
                {summary.join(" · ")}
              </p>
              <fieldset className="conditions-controls" disabled={busy}>
                <div className="condition-fields">
                  <div className="field-row">
                    <label htmlFor="servings">Servings</label>
                    <div className="number-control">
                      <button
                        type="button"
                        aria-label="Decrease servings"
                        onClick={() =>
                          setField(
                            "servings",
                            Math.max(1, (context.servings || 1) - 1),
                          )
                        }
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        id="servings"
                        type="number"
                        min="1"
                        max="12"
                        value={context.servings ?? ""}
                        placeholder="Not set"
                        onChange={(e) =>
                          setField(
                            "servings",
                            e.target.value
                              ? Math.max(
                                  1,
                                  Math.min(12, Number(e.target.value)),
                                )
                              : null,
                          )
                        }
                      />
                      <button
                        type="button"
                        aria-label="Increase servings"
                        disabled={(context.servings || 0) >= 12}
                        onClick={() =>
                          setField(
                            "servings",
                            Math.min(12, (context.servings || 0) + 1),
                          )
                        }
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="field-row">
                    <label htmlFor="budget">Budget limit</label>
                    <div className="input-suffix">
                      <span>NT$</span>
                      <input
                        id="budget"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="Not decided"
                        value={context.budgetTwd ?? ""}
                        onChange={(e) =>
                          setField(
                            "budgetTwd",
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      />
                      <small>
                        {context.mealCount > 1
                          ? `For ${context.mealCount} meals`
                          : "This meal"}
                      </small>
                    </div>
                  </div>
                  <div className="field-row field-column">
                    <label htmlFor="pantry">Ingredients available at home</label>
                    <input
                      className="text-input"
                      id="pantry"
                      value={pantryText}
                      placeholder="Example: tofu, greens, eggs"
                      onChange={(e) => {
                        setPantryText(e.target.value);
                        invalidateAnswer();
                      }}
                      onBlur={() =>
                        setField(
                          "pantryItems",
                          parsePantry(pantryText, context.pantryItems),
                        )
                      }
                    />
                    <span className="field-hint">
                      Separate items with commas. Add amounts after an item, for example: tofu 150 g.
                    </span>
                  </div>
                  <div className="field-row field-column">
                    <span className="field-label">Available equipment</span>
                    <div className="equipment-options">
                      {(Object.keys(equipmentLabels) as Equipment[]).map(
                        (equipment) => (
                          <button
                            type="button"
                            key={equipment}
                            className={
                              "choice-chip" +
                              (context.equipment.includes(equipment)
                                ? " chosen"
                                : "")
                            }
                            onClick={() => toggleEquipment(equipment)}
                            aria-pressed={context.equipment.includes(equipment)}
                          >
                            {equipmentLabels[equipment]}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="disclosure-trigger"
                  type="button"
                  aria-expanded={detailsOpen}
                  onClick={() => setDetailsOpen(!detailsOpen)}
                >
                  <span>
                    <Plus size={16} />
                    Add more details
                  </span>
                  {detailsOpen ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </button>
                {detailsOpen && (
                  <div className="extra-fields">
                    <div className="field-row">
                      <label htmlFor="meal-count">Number of meals</label>
                      <div className="number-control">
                        <button
                          type="button"
                          aria-label="Decrease meal count"
                          onClick={() =>
                            setField(
                              "mealCount",
                              Math.max(1, context.mealCount - 1),
                            )
                          }
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          id="meal-count"
                          type="number"
                          min="1"
                          max="7"
                          value={context.mealCount}
                          onChange={(e) =>
                            setField(
                              "mealCount",
                              Math.max(1, Number(e.target.value) || 1),
                            )
                          }
                        />
                        <button
                          type="button"
                          aria-label="Increase meal count"
                          onClick={() =>
                            setField(
                              "mealCount",
                              Math.min(7, context.mealCount + 1),
                            )
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="field-row">
                      <label htmlFor="time">Maximum cooking time</label>
                      <div className="input-suffix">
                        <input
                          id="time"
                          type="number"
                          min="1"
                          placeholder="No limit"
                          value={context.maxTimeMinutes ?? ""}
                          onChange={(e) =>
                            setField(
                              "maxTimeMinutes",
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        />
                        <small>min</small>
                      </div>
                    </div>
                    <div className="field-row field-column">
                      <label htmlFor="excluded">Ingredients to exclude</label>
                      <input
                        className="text-input"
                        id="excluded"
                        value={excludedText}
                        placeholder="Example: peanuts, shrimp"
                        onChange={(e) => {
                          setExcludedText(e.target.value);
                          invalidateAnswer();
                        }}
                        onBlur={() =>
                          setField("excludedIngredients", split(excludedText))
                        }
                      />
                      <span className="field-hint">
                        List confirmed restrictions only. You do not need to share diagnoses or medications.
                      </span>
                    </div>
                    <div className="field-row field-column">
                      <label htmlFor="preferences">Taste or cooking preferences</label>
                      <input
                        className="text-input"
                        id="preferences"
                        value={preferencesText}
                        placeholder="Example: mild, not spicy, softer texture"
                        onChange={(e) => {
                          setPreferencesText(e.target.value);
                          invalidateAnswer();
                        }}
                        onBlur={() =>
                          setField("preferences", split(preferencesText))
                        }
                      />
                    </div>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={context.onlyPantry}
                        onChange={(e) =>
                          setField("onlyPantry", e.target.checked)
                        }
                      />
                      <span>Use only ingredients available at home</span>
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={context.uncertainty}
                        onChange={(e) =>
                          setField("uncertainty", e.target.checked)
                        }
                      />
                      <span>Some details are uncertain; ask me first</span>
                    </label>
                    <div className="price-editor">
                      <div className="field-label">Ingredient prices I know</div>
                      <p>Estimates use only the prices you provide. Missing prices are marked for confirmation.</p>
                      {context.purchasePrices.map((q) => (
                        <div className="quote-row" key={q.name}>
                          <span>
                            {q.name} · {q.quantity}
                            {q.unit}
                          </span>
                          <strong>NT$ {q.priceTwd}</strong>
                          <button
                            type="button"
                            aria-label={"Remove price for " + q.name}
                            onClick={() =>
                              setField(
                                "purchasePrices",
                                context.purchasePrices.filter(
                                  (x) => x.name !== q.name,
                                ),
                              )
                            }
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                <div className="price-inputs">
                        <label>
                          Ingredient
                          <input
                            value={priceName}
                            onChange={(e) => setPriceName(e.target.value)}
                          />
                        </label>
                        <label>
                          Package amount
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={priceQty}
                            onChange={(e) => setPriceQty(e.target.value)}
                          />
                        </label>
                        <label>
                          Unit
                          <select
                            value={priceUnit}
                            onChange={(e) =>
                              setPriceUnit(e.target.value as Unit)
                            }
                          >
                            {units.map((unit) => (
                              <option key={unit} value={unit}>{displayUnit(unit)}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Price (TWD)
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                          />
                        </label>
                        <button
                          className="text-action"
                          type="button"
                          onClick={addPrice}
                        >
                          Add price
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>
              <div className="conditions-footnote">
                <CircleAlert size={16} />
                <p>
                  Do not enter names, medical records, or medication details. If a dietary restriction is unclear, we will ask you to confirm it.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section
          className="how-section"
          id="how-it-works"
          aria-labelledby="help-title"
        >
          <h2 id="help-title">How it works</h2>
          <ol className="how-steps" role="list">
            <li>
              <strong>Describe your needs</strong>
              <p>Tell us what you have, how many people you are cooking for, or your budget.</p>
            </li>
            <li>
              <strong>Choose a meal</strong>
              <p>Review ingredients, steps, and any prices that need confirmation.</p>
            </li>
            <li>
              <strong>Adjust as needed</strong>
              <p>Change the servings or ingredients and send again to check the updated details.</p>
            </li>
          </ol>
          <aside className="scope-note">
            <strong>Scope</strong>
            <p>
              For questions about medical diets, allergies, or medications, consult a doctor, pharmacist, or dietitian.
              CareKitchen does not provide diagnoses or medical diet prescriptions.
            </p>
          </aside>
        </section>
      </main>
      <footer className="footer">
        <a className="brand footer-brand" href="#top">
          CareKitchen
        </a>
        <Link href="/evidence/waicy" className="text-link" prefetch={false}>
          WAICY test evidence
        </Link>
        <a className="text-link" href="#top">
          Back to top
        </a>
      </footer>

      {shareCard && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShareCard(null);
          }}
        >
          <section
            ref={shareDialog}
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-title"
            tabIndex={-1}
          >
            <div className="modal-heading">
              <div>
                <h2 id="share-title">Preview what you will share</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close preview"
                onClick={() => setShareCard(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="modal-intro">
              This includes information about this meal only, not your chat or personal conditions.
            </p>
            <pre className="share-preview-text">
              {shareLines(shareCard).join("\n")}
            </pre>
            {shareNotice && (
              <p className="share-feedback" role="status">
                {shareNotice}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button button-quiet"
                onClick={() => setShareCard(null)}
              >
                Back
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void copyShare()}
              >
                <Copy size={17} />
                Copy summary
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function MealOption({
  card,
  index,
  expanded,
  onToggle,
  onPreview,
  context,
  simpleMode,
  busy,
}: {
  card: MealCard;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onPreview: (button: HTMLButtonElement) => void;
  context: MealContext;
  simpleMode: boolean;
  busy: boolean;
}) {
  const existing = itemNames(card.fromPantry),
    missing = itemNames(card.toBuy);
  const status =
    card.budgetStatus === "within"
      ? "cost-good"
      : card.budgetStatus === "over"
        ? "cost-alert"
        : "cost-unknown";
  return (
    <article className="meal-card">
      <p className="meal-index">Meal {index + 1}</p>
      <h4>{card.title}</h4>
      <p className="meal-meta">
        {countLabel(card.servings, "serving")} · {countLabel(card.mealCount, "meal")} · about {card.minutes} min ·{" "}
        {equipmentLabels[card.equipment]}
      </p>
      {card.reason && <p className="meal-reason">{card.reason}</p>}
      <p className={"cost-line " + status}>{priceLabel(card)}</p>
      {(card.unknownPantry.length > 0 || card.missingPrices.length > 0) && (
        <p className="meal-unknown">
          <CircleAlert size={15} />
          {[
            ...card.unknownPantry.map((x) => x + " amount to confirm"),
          ...card.missingPrices.map((x) => x + " price to confirm"),
          ].join(" · ")}
        </p>
      )}
      {context.excludedIngredients.length > 0 && (
        <p className="applied-restrictions">
          Excluded ingredients: {context.excludedIngredients.join(", ")}
        </p>
      )}
      <div className="meal-items">
        <div>
          <span className="item-label">Available at home</span>
          <span className="item-names">{existing.join(", ") || "To confirm"}</span>
        </div>
        <div>
          <span className="item-label">To buy</span>
          <span className="item-names">
            {missing.length
              ? card.toBuy
                  .map(
                    (x) =>
                      itemNames([x])[0] +
                      (x.priceTwd == null
                        ? " · price to confirm"
                        : " · NT$ " + x.priceTwd),
                  )
                  .join(", ")
              : "None"}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="steps-toggle"
        aria-expanded={expanded}
        onClick={onToggle}
        disabled={busy}
      >
        <span>{expanded ? "Hide cooking steps" : "View simple steps"}</span>
        {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {expanded && (
        <div className="steps-content">
          <ol>
            {card.steps.map((step, i) => (
              <li key={i}>
                {simpleMode ? step : "Step " + (i + 1) + ": " + step}
              </li>
            ))}
          </ol>
          <p>Check ingredient freshness, storage, and heating instructions on the packaging and follow safe food-handling practices.</p>
        </div>
      )}
      <button
        className="share-action"
        type="button"
        disabled={busy}
        onClick={(event) => onPreview(event.currentTarget)}
      >
        <Copy size={16} />
        Preview and copy meal summary
      </button>
    </article>
  );
}
