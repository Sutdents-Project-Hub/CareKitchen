# CareKitchen｜專案總覽、範圍與驗收

> 狀態：本機 Web 原型已實作，OpenAI 真實呼叫、使用者研究與公開展示待驗證。
> 最詳細的功能與 AC 以 `docs/product-spec.md` 為準；正式比賽要求以 `docs/competition.md` 為準。

## 1. 願景

CareKitchen 為 WAICY 2026 第 4 賽道 LLM & AI Agent（AI as a Service）打造，目的是讓長者、家庭照護者與家屬透過持續對話，依照**現有食材、可負擔的新增採買預算、料理設備、生活偏好，以及使用者已確認的限制**規劃實際可討論的一餐。

**不是**疾病診斷、藥物與食物相容性判定、精準營養治療、專業背書或即時菜價查詢。需求背景仍待真實使用者研究佐證。

## 2. 三種 Persona

- A **獨居長者**：一人份、少採買、易煮與大字短步驟。
- B **家庭照護者**：明確限制不遺漏、合適份量／設備、哪些地方須專業確認。
- C **家屬**：餐點候選、合併採買與待確認價格，尊重長者的選擇。

## 3. P0 競賽目標

1. 真正可操作、可持續對話的 LLM 專用餐點顧問。
2. 三角色的同題回答有需求導向的實際差異。
3. 逐步收集與維持人數、預算、食材、價格、設備、偏好與既定限制。
4. 2–3 個建議方向、簡短步驟、候選替換與採買摘要。
5. 未知價格明示未知、已知超支提醒取捨、硬限制保留、醫療問題適當轉介。
6. 實際 Baseline、版本變更、測試與失敗證據。
7. 評審能操作的公開連結、最後版至少 10 輪完整真實互動之可閱讀分享連結，以及完整英文 PDF。

以上是**未來必須達成的驗收目標**，不是已交付功能清單。

## 4. P1／刻意不做

- 語音、拍照 OCR、收藏、一週菜單、飲食訂購、營養資料庫、即時菜價。
- 疾病風險預測、藥物交互作用、自動治療菜單、處方辨識與臨床保證。
- 長期健康檔案、真實姓名／病歷儲存、會員登入、家屬帳號協作。
- 多 Agent 複雜系統、原生 App、CMS、額外 backend 微服務。

新增上述項目需要重新評估時間、安全、成本、測試與競賽價值，不因可能性高就預先實作。

## 5. 技術與初始化狀態

- Stage：`competition`；Product：`web`；Bootstrap：`scaffold`。
- 唯一可執行元件為 `web/`，採 Next.js App Router、TypeScript、Node.js 24 LTS 與 pnpm。
- Next.js Server Route Handlers 預計處理 LLM、規則與會話；未確定 AI provider、資料庫或部署平台。
- 本機 Git：已由初始化器建立 `main`，有初始 commit；尚無 remote、未 push。後續新增 docs 目前依 Git 狀態實際確認。
- 原始企劃與競賽指南複本存於**被 Git 忽略**的 `docs/inputs-private/`，不能當可公開素材自動推送。

## 6. 交接路線

1. 先讀 `docs/handoff-for-codex-claude.md`。
2. 依 `docs/implementation-roadmap.md` 完成官方 Next.js skeleton 和最短端到端 AI chat。
3. 用 `docs/agent-design.md`、`docs/api-and-data-contracts.md` 完成安全的多輪狀態及候選驗證。
4. 依 `docs/evaluation-and-iteration.md` 保留每一版真實實驗。
5. 最後依 `docs/competition.md` 和 `docs/demo-script.md` 整理評審可查的作品、對話與英文 PDF。

## 7. 工作完成關卡

- 產品驗收：`docs/product-spec.md` 的 CK-01～CK-10／AC-01～AC-14。
- 評估：同題同模型比較、原始回答與評分、失敗與重跑，不能造假結果。
- 風險：無依據價格精算、醫療安全保證、忽略禁食、資訊外洩不可忽視。
- 展示：無痕瀏覽器能操作、對話連結不需私人登入、英文 PDF 逐項完整。
- 文件：每次功能或架構改動，同步更新對應權威文件；未測試一律標 PLANNED。

## 8. 未決事項

AI 供應商／模型與費率、公開部署與持久化方案、資料保存期限、分享同意與撤回機制、學生報名資格、真實受試者與授權、GitHub repo 所有權與 LICENSE，仍須於相應階段確認。不要自行推定選項已被核准。
