# 學生專案 Profile

## 基本資訊

- Project name：CareKitchen｜長者 AI 餐點顧問
- Repository name：`CareKitchen`
- Project slug：`carekitchen`
- Local Docker Compose project：`carekitchen`
- Stage：`competition`
- Product type：`web`
- Bootstrap mode：`scaffold`
- Deployment：`planned`
- Team collaboration：`true`
- Technology policy：未指定時採公司技術基線
- Structure exception：無；使用固定 component root

## 摘要

WAICY 2026 第 4 賽道 LLM & AI Agent（AI as a Service）：以對話協助長者、家庭照護者與家屬，根據現有食材、使用者自行提供的價格和預算、口味、設備及已確認的飲食限制，規劃可調整、易理解的餐點；不提供醫療、用藥或臨床飲食安全判定。

## 元件

- `web`：path=`web`，kind=`web`，framework=`Next.js`，package_manager=`pnpm`，quality=lint, typecheck, test, build，technology_source=`company-default`

## 功能領域

- 三種角色差異化服務：獨居長者、家庭照護者、家屬
- 逐步收集人數、預算、現有食材、價格、料理設備與已確認限制
- 可維持上下文的 AI 餐點規劃與 2 至 3 個候選
- 更換食材、偏好、人數、時間後重新檢查所有硬條件
- 價格缺漏、限制不明或衝突時提供透明追問或不確定性
- 簡易料理步驟、採買清單與可供家屬自行分享的摘要
- 真實 Baseline、V1、V2、V3 逐版測試與最終版可分享對話證據

## 專案限制

- 2026-11-20 初始化輪次僅建立文件與目錄；後續 Web 實作、GitHub 同步與部署依各次授權處理
- 競賽鎖定 WAICY 2026 第 4 賽道 LLM & AI Agent：服務明確性、三種角色、實測迭代與最終可操作 AI 連結為核心
- 先維持單一 Web 可執行元件，Server Route Handlers 執行 AI 呼叫與安全檢核，不預先建立 NestJS、App、CMS 或 worker
- 任何藥物與食物交互作用、疾病診斷、調藥、醫療飲食處方與保證安全都在第一版範圍之外
- 金額與材料價格來源不完整時，不可虛構精確費用或宣稱已通過預算；明確限制不得在替換餐點時無聲遺漏
- 原始測試與使用者訪談不得捏造；正式報告只呈現實際取得、可重現的證據
- 預設採虛構案例，不蒐集長者姓名、病歷、處方、學生身分、地址、照片或其他非必要個資
- AI provider keys 僅能留在伺服器環境；沒有核准不得新增實際付費服務或外部資源
- 參賽文件預計以英文 PDF 繳交，目標提早於 2026-11-29 完成，但截止以官方最新公告為準
- 這不是臨床或藥師核准工具，也不應主張為經驗證的營養處方

## 關注事項

- ai
- external-api
- personal-data
- database

## 假設

- Web 已使用 Next.js 16、TypeScript、Node.js 24 LTS 與 pnpm 10，版本證據見 `web/package.json` 與 lockfile
- Next.js Server Route Handlers 提供聊天、條件檢核與費用核算；唯讀分享仍在規劃
- 展示介面採繁體中文優先、大字體與高對比，英文正式報告另行準備；語音非 P0
- 先採訪客情境，沒有登入與個人健康檔案；對話儲存與公開分享需明確同意及匿名化
- 使用者輸入的實際價格是可核對成本的主要依據；缺漏價格視為未知而非假裝為零
- 公開可操作展示與長期保存真實對話可能需要資料儲存，實際服務與方案待驗證

## 未決定事項

- 已選 OpenAI Responses API，預設模型 `gpt-4.1-mini`；真實帳號、配額、費用及模型輸出待確認
- 公開展示的平台、網址、運行限制與未登入評審的可及性尚未決定
- 是否使用托管 PostgreSQL 或其他具備持久化的儲存；先確認分享連結方案、刪除期限與費用
- 公開分享對話需哪些事前同意、脫敏、期限與撤回機制？
- 有無實際長者與照護者訪談，以及介面與回答易懂度的可用性驗證？
- WAICY 2026 截止時間、報名資格及對話紀錄分享方式需交件前官方再次確認
- GitHub 倉庫使用 `Sutdents-Project-Hub/CareKitchen`；專案開源授權待確認
