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
  elder: { title: "我自己準備", line: "找簡單的家常菜和做法" },
  caregiver: { title: "幫家人準備", line: "照顧份量與已確認的限制" },
  family: { title: "和家人一起安排", line: "整理採買，方便一起討論" },
};
const roleOrder: Persona[] = ["elder", "caregiver", "family"];
const modeNames: Record<ChatMode, string> = {
  openai: "AI 對話",
  local: "本機規劃",
  unavailable: "暫時無法連線",
};
const split = (value: string) =>
  value
    .split(/[，,、\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
function parsePantry(value: string, previous: ItemAmount[]): ItemAmount[] {
  return split(value).map((raw) => {
    const match = raw.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(g|ml|個|份)?$/i);
    if (match)
      return {
        name: match[1].trim(),
        quantity: Number(match[2]),
        unit: (match[3] as Unit | undefined) ?? null,
      };
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
      x.name + (x.quantity == null ? "" : " " + x.quantity + (x.unit || "")),
  );
const money = (value: number) => "NT$ " + value.toLocaleString("zh-TW");

function conditionChanges(before: MealContext, after: MealContext) {
  const changes: string[] = [];
  if (before.servings !== after.servings && after.servings !== null) {
    changes.push(`${after.servings} 人份`);
  }
  if (before.mealCount !== after.mealCount)
    changes.push(`${after.mealCount} 餐`);
  if (before.budgetTwd !== after.budgetTwd && after.budgetTwd !== null) {
    changes.push(`預算 ${money(after.budgetTwd)}`);
  }
  if (before.equipment.join() !== after.equipment.join()) {
    changes.push(
      after.equipment.length
        ? after.equipment.map((item) => equipmentLabels[item]).join("、")
        : "設備待確認",
    );
  }
  const exclusions = after.excludedIngredients.filter(
    (item) => !before.excludedIngredients.includes(item),
  );
  if (exclusions.length) changes.push(`排除 ${exclusions.join("、")}`);
  if (
    itemNames(before.pantryItems).join() !== itemNames(after.pantryItems).join()
  )
    changes.push("更新現有食材");
  if (
    JSON.stringify(before.purchasePrices) !==
    JSON.stringify(after.purchasePrices)
  )
    changes.push("已記下你提供的報價");
  if (before.onlyPantry !== after.onlyPantry)
    changes.push(after.onlyPantry ? "只用現有食材" : "可採買");
  return changes;
}

function priceLabel(card: MealCard) {
  if (card.toBuy.length === 0 && card.unknownPantry.length === 0)
    return "這道不用另外採買";
  if (card.budgetStatus === "unknown") {
    const reason = card.missingPrices.length
      ? "採買總額待確認"
      : "請先確認家裡的食材份量";
    return card.knownCostTwd > 0
      ? reason + " · 已知小計 " + money(card.knownCostTwd)
      : reason;
  }
  if (card.budgetStatus === "within")
    return "依提供價格估算 " + money(card.knownCostTwd);
  if (card.budgetStatus === "over")
    return "已知採買 " + money(card.knownCostTwd) + "，高於預算";
  return "已知採買 " + money(card.knownCostTwd) + " · 未設定預算";
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
    context.servings ? context.servings + " 人" : "人數待補",
    context.mealCount + " 餐",
    context.budgetTwd == null ? "預算待補" : context.budgetTwd + " 元",
  ];
  if (context.equipment.length)
    keyConditions.push(
      context.equipment.map((item) => equipmentLabels[item]).join("、"),
    );
  if (context.excludedIngredients.length)
    keyConditions.push("排除 " + context.excludedIngredients.join("、"));
  if (context.uncertainty) keyConditions.push("飲食限制待確認");
  const summary = context.pantryItems.length
    ? [...keyConditions, itemNames(context.pantryItems).slice(0, 3).join("、")]
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
            : "目前無法取得新的建議，條件和輸入都保留了，請稍後重試。",
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
      setPantryText(itemNames(reply.context.pantryItems).join("、"));
      setExcludedText(reply.context.excludedIngredients.join("、"));
      setPreferencesText(reply.context.preferences.join("、"));
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
      setNotice("目前無法取得新的建議，條件和輸入都保留了，請稍後重試。");
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
        ? "我想準備一人份晚餐，家裡有豆腐 150 克和青菜 120 克，預算 100 元，只有電鍋。"
        : persona === "caregiver"
          ? "我幫家人準備兩人份晚餐，手邊有豆腐 300 克和青菜 240 克，預算 100 元，只有電鍋，不能吃蛋。"
          : "請安排三人份晚餐，家裡有豆腐 150 克和青菜 120 克，預算 100 元，只有電鍋，請整理採買清單。";
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
      "餐點：" +
        card.title +
        "（" +
        card.servings +
        " 人份 · " +
        card.mealCount +
        " 餐）",
      "時間：約 " + card.minutes + " 分鐘 · " + equipmentLabels[card.equipment],
      "家裡已有：" + (itemNames(card.fromPantry).join("、") || "待確認"),
      "需要採買：" +
        (card.toBuy.length
          ? card.toBuy
              .map(
                (x) =>
                  itemNames([x])[0] +
                  (x.priceTwd == null
                    ? "（價格待確認）"
                    : "（NT$ " + x.priceTwd + "）"),
              )
              .join("、")
          : "暫無"),
      "採買金額：" + priceLabel(card),
      "料理步驟：",
      ...card.steps.map((x, i) => i + 1 + ". " + x),
      "不確定的飲食限制，請先向專業人員確認。",
    ];
  }
  async function copyShare() {
    if (!shareCard || !current) return;
    const c = shareCard;
    const lines = shareLines(c);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setShareNotice("已複製餐點摘要。");
      setShareCard(null);
    } catch {
      setShareNotice("無法自動複製，請選取預覽文字後自行複製。");
    }
  }

  return (
    <div id="top" className={"app-shell" + (largeText ? " large-text" : "")}>
      <a className="skip-link" href="#workspace">
        跳到餐點工作區
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="CareKitchen 首頁">
            CareKitchen
          </a>
          <nav className="top-links" aria-label="主要導覽">
            <a href="#workspace">餐點規劃</a>
            <a href="#how-it-works">使用說明</a>
          </nav>
          <div className="access-tools" aria-label="閱讀設定">
            <button
              type="button"
              className="text-tool"
              aria-pressed={simpleMode}
              onClick={() => setSimpleMode(!simpleMode)}
            >
              簡易模式
            </button>
            <button
              type="button"
              className="font-tool"
              aria-pressed={largeText}
              onClick={() => setLargeText(!largeText)}
            >
              {largeText ? "縮小文字" : "放大文字"}
            </button>
          </div>
        </div>
      </header>

      <main>
        <div className="entry-grid">
          <section className="hero" aria-labelledby="hero-heading">
            <h1 id="hero-heading">
              <span>用手邊食材</span>
              <span>規劃今天這一餐</span>
            </h1>
            <p>依照預算、設備和已確認的飲食限制，找出幾道做得來的家常菜。</p>
            <a className="button button-primary" href="#roles">
              開始規劃一餐 <ArrowDown size={18} aria-hidden="true" />
            </a>
          </section>
          <section
            className="role-section"
            id="roles"
            tabIndex={-1}
            aria-labelledby="role-heading"
          >
            <h2 id="role-heading">這餐為誰準備？</h2>
            <div className="role-tabs" role="group" aria-label="選擇使用情境">
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
                    <span className="role-current">目前選用</span>
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
              <h2 id="workspace-title">餐點工作區</h2>
            </div>
            <div
              className={
                "connection-state" +
                (mode === "unavailable" ? " state-muted" : "")
              }
            >
              {modeReady ? modeNames[mode] : "正在確認服務…"}
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
                      對話規劃
                    </h3>
                  </div>
                  <div className="conversation-tools">
                    <span className="conversation-role">
                      {personaLabels[persona]}
                    </span>
                    <a href="#meal-conditions" className="text-link">
                      修改條件
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
                            {entry.role === "assistant" ? "CareKitchen" : "你"}
                          </span>
                          <p>{entry.text}</p>
                          {Boolean(entry.changes?.length) && (
                            <p className="turn-changes">
                              這輪已更新 · {entry.changes?.join("、")}
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
                            正在依照目前條件整理…
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
                        重試
                      </button>
                    )}
                  </div>
                )}
                <form className="composer" onSubmit={submit}>
                  <label className="composer-label" htmlFor="message">
                    描述今天想準備的餐點
                  </label>
                  <textarea
                    id="message"
                    rows={2}
                    maxLength={600}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="例如：我有豆腐和青菜，想煮簡單一點…"
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
                      {draft.length}/600 · Enter 送出 · Shift + Enter 換行
                    </span>
                    <button
                      className="send-button"
                      type="submit"
                      disabled={busy || !draft.trim()}
                      aria-label="送出訊息"
                    >
                      {busy && (
                        <LoaderCircle
                          size={18}
                          className="spin"
                          aria-hidden="true"
                        />
                      )}
                      <span>{busy ? "處理中" : "送出"}</span>
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
                        <strong>試試看一個例子</strong>
                        <small>
                          {persona === "elder"
                            ? "一人份 · 豆腐和青菜 · 100 元"
                            : persona === "caregiver"
                              ? "幫家人準備 · 帶入備餐條件"
                              : "三人份 · 看看要買什麼"}
                        </small>
                      </span>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </button>
                    <div className="quick-prompts" aria-label="快速開始">
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt("我想用家裡現有的食材規劃一餐。")
                        }
                      >
                        用現有食材
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt(
                            "請依照我填的預算規劃，並標出還沒確認的價格。",
                          )
                        }
                      >
                        看看預算
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt("請依照我已確認不使用的食材調整餐點。")
                        }
                      >
                        套用已確認限制
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          choosePrompt(
                            "請整理這餐的採買清單，列出數量和待確認價格。",
                          )
                        }
                      >
                        整理採買
                      </button>
                    </div>
                  </div>
                )}
                {activeCards.length > 0 && (
                  <a className="result-jump text-link" href="#meal-results">
                    查看 {activeCards.length} 道餐點{" "}
                    <ArrowDown size={16} aria-hidden="true" />
                  </a>
                )}
                <p className="conversation-privacy">
                  OpenAI 模式會傳送這一輪的訊息與規劃條件。
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
                    餐點建議
                  </h3>
                  {activeCards.length > 0 && (
                    <button
                      className="text-action"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void send("請依照目前條件換一道，並避開前面列出的餐點。")
                      }
                    >
                      <RefreshCw size={16} />
                      換一道
                    </button>
                  )}
                </div>
                {!activeCards.length ? (
                  <p className="results-empty">
                    {busy
                      ? "正在檢查這一輪的條件。"
                      : thread.length
                        ? "目前沒有可顯示的餐點。"
                        : "送出需求後，這裡會列出候選餐點。"}
                  </p>
                ) : (
                  <>
                    {context.servings !== null &&
                      (context.servings > 2 || context.mealCount > 1) && (
                        <p className="meal-batch-note">
                          {context.mealCount > 1
                            ? `各候選按同一道料理準備 ${context.mealCount} 餐。`
                            : ""}
                          加熱料理以每批約 2 人份估時，實際批次依設備容量調整。
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
                      還需要確認
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
                  這餐的條件
                </h3>
              </div>
              <p className="conditions-summary" aria-live="polite">
                {summary.join(" · ")}
              </p>
              <fieldset className="conditions-controls" disabled={busy}>
                <div className="condition-fields">
                  <div className="field-row">
                    <label htmlFor="servings">準備幾人份</label>
                    <div className="number-control">
                      <button
                        type="button"
                        aria-label="減少人數"
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
                        placeholder="未設定"
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
                        aria-label="增加人數"
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
                    <label htmlFor="budget">預算上限</label>
                    <div className="input-suffix">
                      <span>NT$</span>
                      <input
                        id="budget"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="還沒決定"
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
                          ? `共 ${context.mealCount} 餐`
                          : "這餐"}
                      </small>
                    </div>
                  </div>
                  <div className="field-row field-column">
                    <label htmlFor="pantry">家裡現有食材</label>
                    <input
                      className="text-input"
                      id="pantry"
                      value={pantryText}
                      placeholder="例如：豆腐、青菜、雞蛋"
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
                      用逗號或頓號分開；數量可寫在後面，例如豆腐 150g。
                    </span>
                  </div>
                  <div className="field-row field-column">
                    <span className="field-label">可以使用的設備</span>
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
                    再補充其他條件
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
                      <label htmlFor="meal-count">想規劃幾餐</label>
                      <div className="number-control">
                        <button
                          type="button"
                          aria-label="減少餐數"
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
                          aria-label="增加餐數"
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
                      <label htmlFor="time">最多料理時間</label>
                      <div className="input-suffix">
                        <input
                          id="time"
                          type="number"
                          min="1"
                          placeholder="不限"
                          value={context.maxTimeMinutes ?? ""}
                          onChange={(e) =>
                            setField(
                              "maxTimeMinutes",
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        />
                        <small>分鐘</small>
                      </div>
                    </div>
                    <div className="field-row field-column">
                      <label htmlFor="excluded">已確認不使用的食材</label>
                      <input
                        className="text-input"
                        id="excluded"
                        value={excludedText}
                        placeholder="例如：花生、蝦"
                        onChange={(e) => {
                          setExcludedText(e.target.value);
                          invalidateAnswer();
                        }}
                        onBlur={() =>
                          setField("excludedIngredients", split(excludedText))
                        }
                      />
                      <span className="field-hint">
                        只填已確認的限制；不必提供病名或藥物。
                      </span>
                    </div>
                    <div className="field-row field-column">
                      <label htmlFor="preferences">口味或料理偏好</label>
                      <input
                        className="text-input"
                        id="preferences"
                        value={preferencesText}
                        placeholder="例如：清淡、不辣、軟一點"
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
                      <span>希望只用家裡現有食材</span>
                    </label>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={context.uncertainty}
                        onChange={(e) =>
                          setField("uncertainty", e.target.checked)
                        }
                      />
                      <span>有些條件不太確定，請先問我</span>
                    </label>
                    <div className="price-editor">
                      <div className="field-label">我知道的食材價格</div>
                      <p>只依你提供的價格估算，沒有價格會標示待確認。</p>
                      {context.purchasePrices.map((q) => (
                        <div className="quote-row" key={q.name}>
                          <span>
                            {q.name} · {q.quantity}
                            {q.unit}
                          </span>
                          <strong>NT$ {q.priceTwd}</strong>
                          <button
                            type="button"
                            aria-label={"移除" + q.name + "價格"}
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
                          食材名稱
                          <input
                            value={priceName}
                            onChange={(e) => setPriceName(e.target.value)}
                          />
                        </label>
                        <label>
                          包裝數量
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={priceQty}
                            onChange={(e) => setPriceQty(e.target.value)}
                          />
                        </label>
                        <label>
                          單位
                          <select
                            value={priceUnit}
                            onChange={(e) =>
                              setPriceUnit(e.target.value as Unit)
                            }
                          >
                            {units.map((unit) => (
                              <option key={unit}>{unit}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          價格（新台幣）
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
                          新增價格
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </fieldset>
              <div className="conditions-footnote">
                <CircleAlert size={16} />
                <p>
                  不需要輸入姓名、病歷或藥物資訊。飲食限制不明時，我們會先請你確認。
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
          <h2 id="help-title">使用說明</h2>
          <ol className="how-steps" role="list">
            <li>
              <strong>說明需求</strong>
              <p>先說家裡有什麼、要煮給幾個人，或這餐想花多少。</p>
            </li>
            <li>
              <strong>選一道料理</strong>
              <p>對照所需食材、做法和待確認的價格。</p>
            </li>
            <li>
              <strong>需要時再調整</strong>
              <p>更改人數或食材後送出，系統會依新條件重新檢查。</p>
            </li>
          </ol>
          <aside className="scope-note">
            <strong>適用範圍</strong>
            <p>
              若有醫療飲食、過敏或藥物相關疑問，請先向醫師、藥師或營養師確認。CareKitchen
              不提供診斷或醫療飲食處方。
            </p>
          </aside>
        </section>
      </main>
      <footer className="footer">
        <a className="brand footer-brand" href="#top">
          CareKitchen
        </a>
        <Link href="/evidence/waicy" className="text-link" prefetch={false}>
          WAICY 實測紀錄
        </Link>
        <a className="text-link" href="#top">
          返回頁首
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
                <h2 id="share-title">先看看要分享的內容</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="關閉預覽"
                onClick={() => setShareCard(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="modal-intro">
              只整理這道餐點資訊，不包含聊天內容或個人條件。
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
                返回
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={() => void copyShare()}
              >
                <Copy size={17} />
                複製這份摘要
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
      <p className="meal-index">餐點 {index + 1}</p>
      <h4>{card.title}</h4>
      <p className="meal-meta">
        {card.servings} 人份 · {card.mealCount} 餐 · 約 {card.minutes} 分鐘 ·{" "}
        {equipmentLabels[card.equipment]}
      </p>
      {card.reason && <p className="meal-reason">{card.reason}</p>}
      <p className={"cost-line " + status}>{priceLabel(card)}</p>
      {(card.unknownPantry.length > 0 || card.missingPrices.length > 0) && (
        <p className="meal-unknown">
          <CircleAlert size={15} />
          {[
            ...card.unknownPantry.map((x) => x + "數量待確認"),
            ...card.missingPrices.map((x) => x + "價格待確認"),
          ].join(" · ")}
        </p>
      )}
      {context.excludedIngredients.length > 0 && (
        <p className="applied-restrictions">
          已套用排除：{context.excludedIngredients.join("、")}
        </p>
      )}
      <div className="meal-items">
        <div>
          <span className="item-label">家裡已有</span>
          <span className="item-names">{existing.join("、") || "待確認"}</span>
        </div>
        <div>
          <span className="item-label">還需要買</span>
          <span className="item-names">
            {missing.length
              ? card.toBuy
                  .map(
                    (x) =>
                      itemNames([x])[0] +
                      (x.priceTwd == null
                        ? " · 價格待確認"
                        : " · NT$ " + x.priceTwd),
                  )
                  .join("、")
              : "暫無"}
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
        <span>{expanded ? "收起料理步驟" : "查看簡單作法"}</span>
        {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
      </button>
      {expanded && (
        <div className="steps-content">
          <ol>
            {card.steps.map((step, i) => (
              <li key={i}>
                {simpleMode ? step : "步驟 " + (i + 1) + "：" + step}
              </li>
            ))}
          </ol>
          <p>食材新鮮度、保存與加熱方式，請依包裝標示與日常安全習慣確認。</p>
        </div>
      )}
      <button
        className="share-action"
        type="button"
        disabled={busy}
        onClick={(event) => onPreview(event.currentTarget)}
      >
        <Copy size={16} />
        預覽並複製餐點摘要
      </button>
    </article>
  );
}
