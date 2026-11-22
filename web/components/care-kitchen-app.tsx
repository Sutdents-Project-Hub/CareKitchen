"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  CookingPot,
  Copy,
  HeartHandshake,
  Leaf,
  ListChecks,
  LoaderCircle,
  MessageCircle,
  Minus,
  Plus,
  RefreshCw,
  Send,
  SlidersHorizontal,
  Sparkles,
  Sprout,
  UsersRound,
  Utensils,
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

type Entry = { role: "assistant" | "user"; text: string };
const roles: Record<Persona, { title: string; line: string; detail: string }> =
  {
    elder: {
      title: "我自己準備",
      line: "想吃得簡單，也顧好今天的預算。",
      detail: "一人一餐 · 步驟清楚",
    },
    caregiver: {
      title: "幫家人準備",
      line: "把已確認的飲食條件，一起帶進每道菜。",
      detail: "條件不遺漏 · 方便調整",
    },
    family: {
      title: "和家人一起安排",
      line: "整理餐點方向，讓採買和討論更容易。",
      detail: "採買一目了然 · 方便分享",
    },
  };
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
function priceLabel(card: MealCard) {
  if (card.budgetStatus === "within")
    return "依提供價格估算 " + money(card.knownCostTwd);
  if (card.budgetStatus === "over")
    return "已知採買 " + money(card.knownCostTwd) + "，高於預算";
  if (card.budgetStatus === "unknown")
    return "價格待確認 · 已知 " + money(card.knownCostTwd);
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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [simpleMode, setSimpleMode] = useState(true);
  const [largeText, setLargeText] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [shareCard, setShareCard] = useState<MealCard | null>(null);
  const [retryRequest, setRetryRequest] = useState<{
    text: string;
    previousMealIds?: string[];
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
  const summary = [
    context.servings ? context.servings + " 人" : "人數待補",
    context.budgetTwd == null ? "預算待補" : context.budgetTwd + " 元",
  ];
  if (context.pantryItems.length)
    summary.push(itemNames(context.pantryItems).slice(0, 3).join("、"));
  if (context.excludedIngredients.length)
    summary.push("排除 " + context.excludedIngredients.join("、"));

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
    setCards([]);
    setAnswerContext(null);
    setUnknowns([]);
    setExpanded(null);
    setNotice("");
  }
  function invalidateAnswer() {
    setCards([]);
    setAnswerContext(null);
    setUnknowns([]);
    setExpanded(null);
    setNotice("");
  }
  function setField<K extends keyof MealContext>(
    key: K,
    value: MealContext[K],
  ) {
    edit((old) => ({ ...old, [key]: value }));
  }
  async function send(textValue = draft, previousMealIds?: string[]) {
    const text = textValue.trim();
    if (!text || busy) return;
    setBusy(true);
    setNotice("");
    setRetryRequest({
      text,
      ...(previousMealIds?.length ? { previousMealIds } : {}),
    });
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
    setThread((old) => [...old, { role: "user", text }]);
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
      if (!r.ok)
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : "目前無法取得新的建議，條件和輸入都保留了，請稍後重試。",
        );
      const reply = data as ChatReply;
      if (reply.mode !== "openai" && reply.mode !== "local")
        throw new Error(
          "目前無法取得新的建議，條件和輸入都保留了，請稍後重試。",
        );
      setMode(reply.mode);
      setContext(reply.context);
      setAnswerContext(reply.context);
      setPantryText(itemNames(reply.context.pantryItems).join("、"));
      setExcludedText(reply.context.excludedIngredients.join("、"));
      setPreferencesText(reply.context.preferences.join("、"));
      setCards(reply.cards);
      setUnknowns(reply.unknowns || []);
      setThread((old) => [...old, { role: "assistant", text: reply.message }]);
      setDraft("");
      setExpanded(null);
      setRetryRequest(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "目前無法取得新的建議，條件和輸入都保留了，請稍後重試。";
      setNotice(message);
      setMode("unavailable");
      setDraft((old) => (old.trim() ? old : text));
      setThread((old) => [...old, { role: "assistant", text: message }]);
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
    const isFamily = persona === "family";
    const servings = isFamily ? 3 : 1;
    const maxTimeMinutes = isFamily ? 110 : 30;
    edit(() => ({
      ...emptyContext,
      servings,
      mealCount: 1,
      budgetTwd: 100,
      pantryItems: [
        { name: "豆腐", quantity: 150, unit: "g" },
        { name: "青菜", quantity: 120, unit: "g" },
      ],
      equipment: ["rice_cooker"],
      maxTimeMinutes,
    }));
    setPantryText("豆腐 150g、青菜 120g");
    setExcludedText("");
    setPreferencesText("");
    setThread([]);
    const exampleText =
      persona === "elder"
        ? "我自己準備晚餐，有 150 克豆腐和 120 克青菜，預算 100 元，只有電鍋，想做簡單一點。"
        : persona === "caregiver"
          ? "我幫家人準備一餐，手邊有 150 克豆腐和 120 克青菜，預算 100 元，只有電鍋。"
          : "週末想和家人一起吃，有 150 克豆腐和 120 克青菜，預算 100 元、只有電鍋，請整理好採買方向。";
    setDraft(exampleText);
    document
      .getElementById("conversation")
      ?.scrollIntoView({ behavior: "smooth" });
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
    setPersona(value);
    setCards([]);
    setAnswerContext(null);
    setThread([]);
    setUnknowns([]);
    setNotice("");
    document.getElementById("workspace")?.scrollIntoView();
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
      setNotice("已複製預覽中的餐點摘要。");
      setShareCard(null);
    } catch {
      setNotice("無法自動複製，請選取預覽內容後自行複製。");
    }
  }

  return (
    <main id="top" className={"app-shell" + (largeText ? " large-text" : "")}>
      <a className="skip-link" href="#workspace">
        跳到餐點工作區
      </a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="CareKitchen 首頁">
          <span className="brand-mark">
            <Sprout size={21} />
          </span>
          <span>
            care<span>kitchen</span>
          </span>
        </a>
        <nav className="top-links" aria-label="主要導覽">
          <a href="#how-it-works">怎麼使用</a>
          <a href="#roles">開始規劃</a>
        </nav>
        <div className="access-tools" aria-label="閱讀設定">
          <button
            type="button"
            className={simpleMode ? "text-tool active" : "text-tool"}
            aria-pressed={simpleMode}
            onClick={() => setSimpleMode(!simpleMode)}
          >
            <BookOpen size={17} />
            {simpleMode ? "簡單閱讀" : "詳細閱讀"}
          </button>
          <button
            type="button"
            className="font-tool"
            aria-pressed={largeText}
            aria-label={largeText ? "縮小文字" : "放大文字"}
            onClick={() => setLargeText(!largeText)}
          >
            Aa
          </button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            好好吃飯，從手邊開始
          </p>
          <h1 id="hero-heading">
            把手邊的食材，
            <br />
            <em>煮成剛好的日常。</em>
          </h1>
          <p className="hero-intro">
            告訴我們家裡有什麼、今天想花多少，
            <br className="desktop-break" />
            一起找一餐簡單、合適的料理方向。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#roles">
              開始規劃一餐 <ArrowDown size={18} />
            </a>
            <span className="hero-note">
              <Leaf size={16} />
              不用先準備完整資料
            </span>
          </div>
          <div className="hero-smallprint">
            <span className="smallprint-dot" />
            依你提供的價格與已確認條件，不猜測醫療需求
          </div>
        </div>
        <div
          className="hero-visual"
          role="img"
          aria-label="暖色廚房桌上的豆腐、青菜與米飯"
        >
          <div className="hero-image" />
        </div>
      </section>

      <section
        className="role-section"
        id="roles"
        aria-labelledby="role-heading"
      >
        <div className="role-heading-row">
          <h2 id="role-heading">今天，想為誰準備？</h2>
          <p>依照你的角色，整理剛好的資訊。</p>
        </div>
        <div className="role-tabs" role="group" aria-label="選擇使用情境">
          {(["elder", "caregiver", "family"] as Persona[]).map((key, index) => {
            const Icon = [Utensils, HeartHandshake, UsersRound][index];
            return (
              <button
                key={key}
                type="button"
                className={"role-tab" + (persona === key ? " selected" : "")}
                onClick={() => selectPersona(key)}
                disabled={busy}
                aria-pressed={persona === key}
              >
                <span className="role-icon">
                  <Icon size={20} />
                </span>
                <span className="role-text">
                  <strong>{roles[key].title}</strong>
                  <small>{roles[key].line}</small>
                </span>
                <span className="role-detail">{roles[key].detail}</span>
                <ArrowUpRight className="role-arrow" size={18} />
              </button>
            );
          })}
        </div>
      </section>

      <section
        className="workspace-section"
        id="workspace"
        aria-labelledby="workspace-title"
      >
        <div className="workspace-heading">
          <div>
            <h2 id="workspace-title">一起規劃今天這一餐</h2>
            <p>不用一次填完，想到什麼再告訴我們就好。</p>
          </div>
          <div
            className={
              "connection-state" +
              (mode === "unavailable" ? " state-muted" : "")
            }
          >
            <span className="connection-dot" />
            {modeReady ? modeNames[mode] : "正在確認服務…"}
          </div>
        </div>
        <div className="workspace-grid">
          <aside
            className="conditions-panel"
            aria-labelledby="conditions-title"
          >
            <div className="panel-top">
              <div className="panel-title">
                <SlidersHorizontal size={18} />
                <h3 id="conditions-title">這餐的條件</h3>
              </div>
              <span className="editable-note">可隨時修改</span>
            </div>
            <div className="conditions-summary" aria-live="polite">
              <span className="summary-mark">
                <Check size={15} />
              </span>
              <span>{summary.join(" · ")}</span>
            </div>
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
                            ? Math.max(1, Math.min(12, Number(e.target.value)))
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
                    <small>這餐</small>
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
                      onChange={(e) => setField("onlyPantry", e.target.checked)}
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
                      <input
                        aria-label="食材名稱"
                        value={priceName}
                        onChange={(e) => setPriceName(e.target.value)}
                        placeholder="食材"
                      />
                      <input
                        aria-label="數量"
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={priceQty}
                        onChange={(e) => setPriceQty(e.target.value)}
                      />
                      <select
                        aria-label="單位"
                        value={priceUnit}
                        onChange={(e) => setPriceUnit(e.target.value as Unit)}
                      >
                        {units.map((unit) => (
                          <option key={unit}>{unit}</option>
                        ))}
                      </select>
                      <input
                        aria-label="價格新台幣"
                        type="number"
                        min="0"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        placeholder="NT$"
                      />
                      <button
                        type="button"
                        onClick={addPrice}
                        aria-label="新增價格"
                      >
                        <Plus size={17} />
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

          <section
            className="conversation-panel"
            id="conversation"
            aria-labelledby="conversation-title"
          >
            <div className="conversation-top">
              <div className="panel-title">
                <MessageCircle size={18} />
                <h3 id="conversation-title">和 CareKitchen 聊聊</h3>
              </div>
              <span className="conversation-role">
                {personaLabels[persona]}
              </span>
            </div>
            {thread.length === 0 ? (
              <div className="conversation-empty">
                <div className="empty-illustration">
                  <div className="empty-bowl">
                    <CookingPot size={41} />
                  </div>
                  <span className="empty-leaf leaf-one">
                    <Sprout size={20} />
                  </span>
                  <span className="empty-leaf leaf-two">
                    <Leaf size={17} />
                  </span>
                </div>
                <h4>今天想吃點什麼？</h4>
                <p>從手邊的食材開始，慢慢告訴我就好。</p>
                <button
                  className="example-prompt"
                  type="button"
                  onClick={example}
                >
                  <span className="example-icon">
                    <Sparkles size={16} />
                  </span>
                  <span>
                    <strong>試試看一個例子</strong>
                    <small>
                      {persona === "elder"
                        ? "一人份 · 豆腐和青菜 · 100 元"
                        : persona === "caregiver"
                          ? "幫家人準備 · 清楚列出條件"
                          : "家人一起吃 · 看看要買什麼"}
                    </small>
                  </span>
                  <ArrowUpRight size={17} />
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
            ) : (
              <div
                className="conversation-feed"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {thread.map((entry, i) => (
                  <div className={"message-row " + entry.role} key={i}>
                    <div className="message-avatar" aria-hidden="true">
                      {entry.role === "assistant" ? <Sprout size={17} /> : "我"}
                    </div>
                    <div className="message-content">
                      <span className="message-author">
                        {entry.role === "assistant" ? "CareKitchen" : "你"}
                      </span>
                      <p>{entry.text}</p>
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="message-row assistant">
                    <div className="message-avatar">
                      <Sprout size={17} />
                    </div>
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
                <button
                  type="button"
                  onClick={() =>
                    retryRequest &&
                    void send(retryRequest.text, retryRequest.previousMealIds)
                  }
                  disabled={
                    busy || !retryRequest || draft.trim() !== retryRequest.text
                  }
                >
                  <RefreshCw size={15} />
                  重試
                </button>
              </div>
            )}
            <form className="composer" onSubmit={submit}>
              <label className="sr-only" htmlFor="message">
                描述今天想準備的餐點
              </label>
              <textarea
                id="message"
                rows={2}
                maxLength={600}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="例如：我有豆腐和青菜，想煮簡單一點…"
                disabled={busy}
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
                  {busy ? (
                    <LoaderCircle size={18} className="spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  <span>送出</span>
                </button>
              </div>
            </form>
            <div className="conversation-privacy">
              <span>
                <span className="privacy-dot" />
                目前條件會用於這次規劃
              </span>
              <span>不會傳送完整對話紀錄</span>
            </div>
          </section>
        </div>

        <section className="results-section" aria-labelledby="results-title">
          <div className="results-heading">
            <div>
              <h3 id="results-title">為你整理的餐點方向</h3>
              <p>先看看哪個方向合適，再一起調整。</p>
            </div>
            {activeCards.length > 0 && (
              <button
                className="text-action"
                type="button"
                disabled={busy}
                onClick={() =>
                  void send(
                    "請依照目前條件換一道，並避開前面列出的餐點。",
                    activeCards.map((c) => c.id),
                  )
                }
              >
                <RefreshCw size={16} />
                換一道
              </button>
            )}
          </div>
          {!activeCards.length ? (
            <div className="results-empty">
              <div className="empty-line-icon">
                <ListChecks size={21} />
              </div>
              <div>
                <strong>
                  {thread.length
                    ? "送出需求後，餐點方向會出現在這裡。"
                    : "還沒有餐點建議"}
                </strong>
                <p>
                  {thread.length
                    ? "條件有修改時，會重新確認後再顯示新的內容。"
                    : "先選一種使用情境，再說說食材或預算。"}
                </p>
              </div>
            </div>
          ) : (
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
                    setShareCard(card);
                  }}
                  context={context}
                  simpleMode={simpleMode}
                  busy={busy}
                />
              ))}
            </div>
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
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-lead">
          <h2>
            不用想得很完整，
            <br />
            先從今天開始。
          </h2>
          <p>一餐一餐慢慢來。你可以先選方向，再逐步補上條件。</p>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <span>01</span>
            <div>
              <strong>說說手邊有什麼</strong>
              <p>食材、預算、設備，想到多少就說多少。</p>
            </div>
          </div>
          <div className="how-step">
            <span>02</span>
            <div>
              <strong>一起看看幾個方向</strong>
              <p>清楚區分家裡已有、還要買，以及價格待確認。</p>
            </div>
          </div>
          <div className="how-step">
            <span>03</span>
            <div>
              <strong>挑喜歡的，再慢慢調整</strong>
              <p>改人數、換食材或偏好，條件都能再確認。</p>
            </div>
          </div>
        </div>
        <aside className="scope-note">
          <div className="scope-note-icon">
            <Sprout size={19} />
          </div>
          <div>
            <strong>這裡陪你規劃日常的一餐。</strong>
            <p>
              若有醫療飲食、過敏或藥物相關疑問，請先向醫師、藥師或營養師確認。CareKitchen
              不提供診斷或醫療飲食處方。
            </p>
          </div>
        </aside>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#top">
          <span className="brand-mark">
            <Sprout size={18} />
          </span>
          <span>
            care<span>kitchen</span>
          </span>
        </a>
        <span>一起好好吃飯，照顧每天的自己。</span>
        <span>© CareKitchen · 日常餐點規劃</span>
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
    </main>
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
    <article className={"meal-card meal-card-" + (index + 1)}>
      <div className="meal-card-top">
        <span className="meal-index">餐點方向 {index + 1}</span>
        <span className="meal-illustration">
          <CookingPot size={21} />
        </span>
      </div>
      <h4>{card.title}</h4>
      <div className="meal-meta">
        <span>
          <UsersRound size={15} />
          {card.servings} 人份 · {card.mealCount} 餐
        </span>
        <span>
          <Clock3 size={15} />約 {card.minutes} 分鐘
        </span>
        <span>
          <CookingPot size={15} />
          {equipmentLabels[card.equipment]}
        </span>
      </div>
      <div className={"cost-line " + status}>
        <span className="cost-mark" />
        {priceLabel(card)}
      </div>
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
        <span>
          <ListChecks size={17} />
          {expanded ? "收起料理步驟" : "查看簡單作法"}
        </span>
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
