# AGENTS.md

## 適用範圍與優先順序

- 本檔適用於整個 `CareKitchen｜長者 AI 餐點顧問` repository；子目錄若有更具體的 `AGENTS.md`，只在該範圍內補充本檔。
- 依序遵守使用者當次指示、本檔、根目錄 `README.md`、`docs/` 與元件 README；內容衝突時先停止並確認。
- 目前階段：競賽／展示。部署狀態：已規劃，平台尚未確認。
- Git repository 名稱：`CareKitchen`。全新專案的初始 branch 為 `main`。

- 產品型態：`web`
- Bootstrap 模式：`scaffold`
- 未指定技術時採公司基線：Node.js 24 LTS、TypeScript、pnpm；Web 使用 Next.js、APP 使用 React Native with Expo、CMS 使用 Payload CMS、Backend 使用 NestJS、Database 使用 PostgreSQL。
- 結構例外：無；使用公司固定 component root。

### 已確認功能領域

- 三種角色差異化服務：獨居長者、家庭照護者、家屬
- 逐步收集人數、預算、現有食材、價格、料理設備與已確認限制
- 可維持上下文的 AI 餐點規劃與 2 至 3 個候選
- 更換食材、偏好、人數、時間後重新檢查所有硬條件
- 價格缺漏、限制不明或衝突時提供透明追問或不確定性
- 簡易料理步驟、採買清單與可供家屬自行分享的摘要
- 真實 Baseline、V1、V2、V3 逐版測試與最終版可分享對話證據

### 專案限制

- 本次只初始化文件與資料夾，不安裝框架、不實作功能、不啟動服務、不建立遠端倉庫或部署
- 競賽鎖定 WAICY 2026 第 4 賽道 LLM & AI Agent：服務明確性、三種角色、實測迭代與最終可操作 AI 連結為核心
- 先維持單一 Web 可執行元件，Server Route Handlers 執行 AI 呼叫與安全檢核，不預先建立 NestJS、App、CMS 或 worker
- 任何藥物與食物交互作用、疾病診斷、調藥、醫療飲食處方與保證安全都在第一版範圍之外
- 金額與材料價格來源不完整時，不可虛構精確費用或宣稱已通過預算；明確限制不得在替換餐點時無聲遺漏
- 原始測試與使用者訪談不得捏造；正式報告只呈現實際取得、可重現的證據
- 預設採虛構案例，不蒐集長者姓名、病歷、處方、學生身分、地址、照片或其他非必要個資
- AI provider keys 僅能留在伺服器環境；沒有核准不得新增實際付費服務或外部資源
- 參賽文件預計以英文 PDF 繳交，目標提早於 2026-11-29 完成，但截止以官方最新公告為準
- 這不是臨床或藥師核准工具，也不應主張為經驗證的營養處方


### 命名對照

| 用途 | 名稱 |
|---|---|
| GitHub repository／本機根資料夾 | `CareKitchen` |
| Project slug | `carekitchen` |
| 本機 Docker Compose project | `carekitchen` |


- 本機 Docker Compose project 使用 project slug 將 `-` 轉為 `_` 的小寫 `snake_case`；主要 Compose 檔必須明確設定頂層 `name: carekitchen`。
- Compose service 使用 `web`、`app`、`api`、`cms`、`backend`、`worker`、`postgres` 等責任角色，原則上不設定 `container_name`，讓 Docker 依 Compose project 與 service 產生容器名稱。



## 專案事實與邊界

WAICY 2026 第 4 賽道 LLM & AI Agent（AI as a Service）：以對話協助長者、家庭照護者與家屬，根據現有食材、使用者自行提供的價格和預算、口味、設備及已確認的飲食限制，規劃可調整、易理解的餐點；不提供醫療、用藥或臨床飲食安全判定。

- `web`：Web 前端；依 `Next.js` 的官方慣例維護，不可把其他元件的秘密或責任移入此處。

- Repository 與新專案根目錄名稱維持 `CareKitchen`；技術資源優先使用 `carekitchen` 或平台既有慣例。
- 新 repository 名稱使用 ASCII 品牌大小寫並以 `_` 分隔多字名稱；不得使用空白、句點或 `-`。Project slug 與一般多字技術名稱使用 lowercase kebab-case。
- 新專案固定 component root 為 `web/`、`app/`、`cms/`、`backend/`、`worker/`、`database/`、`packages/`、`infra/`、`design/`；學生硬體專案可使用 `hardware/`。其他結構必須在 Profile 記錄 `structure_exception`。
- `app/` 本身就是 framework root；同理，Framework manifest 與 lockfile 必須直接位於核准的 component root。禁止 `app/<project-name>/package.json`、`web/<project-name>/package.json` 或 framework-name wrapper。
- `app/app/` 可以是 Expo Router 路由，`web/app/` 可以是 Next.js App Router；只要其中沒有另一份 component manifest，就不是 wrapper。
- Repository 預設只保留根目錄一個 `.git/`；官方 initializer 產生的 component nested .git 必須在確認沒有既有歷史後移除，無法確認時停止。
- 保留現有且可工作的專案結構與框架慣例；新增元件時才選擇清楚、簡短、符合責任的路徑。
- 不因範本而重新命名既有資料夾，不建立未使用的 `app/`、`web/`、`backend/`、`docs/` 或部署資源。
- 不把不同執行環境、依賴或部署生命週期硬塞進同一元件；需要共用程式碼時，先確認至少有兩個真實使用者。
- Scaffold 只代表已核准的結構與技術意圖；只有官方 initializer 產生的實際 manifest、lockfile 與必要品質 script 通過檢查後，才能稱為 executable skeleton。

## 工作方式

- 修改前先讀根 README、相關文件、manifest、設定與實際程式碼；不得只依資料夾名稱猜測。
- 小型文案或單點修正可直接處理；一般功能先說明假設、範圍與驗證；登入、權限、個資、資料庫、刪除、AI 外部服務、部署或跨元件變更先提出計畫與成功標準。
- 只做完成任務所需的最小一致修改；不要混入無關重構、格式化、重新命名、移檔或依賴升級。
- 發現不在範圍內的問題時記錄並回報，不要順手修。
- 以可觀察結果驗證：優先執行現有的 lint、typecheck、test、build 或實際操作；無法執行時明確回報原因與剩餘風險。
- 不得聲稱未實際執行的測試、部署、外部操作或人工驗收已完成。

## 變更分類與文件同步

- 工作中新增或發現功能、需求、流程、既有行為變更、缺陷、測試結果或實作事實時，先分類為釐清、缺陷修正、已核准範圍調整、範圍變更或新能力。
- **使用者當次明確要求**即代表目前敘述方向已獲核准；一般範圍內實作與文件同步**不需額外等待批准**。只有結果會實質改變架構、權限／安全、保存資料、破壞性行為、外部服務／成本／授權、production／部署、競賽驗收或其他明示關卡時才停止確認。
- 實作前辨識受影響的權威文件，完成前在同一任務同步；**文件同步是完成條件**，不是之後再補的工作。
- 專案身份、階段、範圍、狀態與驗收，更新實際存在的 Profile、project overview、產品／需求／驗收文件。
- 元件邊界、架構、API、資料、權限、安全與外部整合，更新架構／專項技術文件及受影響的元件 README。
- 安裝、指令、環境變數、測試、部署、rollback 與交接，更新根／元件 README、`.env.example`、部署與證據文件。
- 競賽主張、Demo 流程、UI 行為與佐證，更新競賽、Demo、測試／證據與設計文件。
- 不為了形式建立所有可能的 Markdown；優先更新既有權威文件，只有持久資訊沒有合適歸屬時才建立聚焦文件。
- 不把規劃、假設或未執行結果寫成**未驗證的事實**；明確區分 planned、implemented、verified、simulated、unavailable 與 unresolved。
- 完成回報列出變更分類與同步文件；若**沒有文件需要變更**，說明文件仍與實作一致的具體理由。

## README 與文件同步

- `README.md` 是專案入口，內容只記錄已確認的目標、功能、結構、技術、啟動、測試、環境變數名稱、部署狀態與文件連結。
- 未驗證的指令、port、URL、帳號、部署值或 healthcheck 必須標示為尚未驗證，不得猜測。
- 功能、架構、依賴、指令、環境變數、資料、部署或限制改變時，同步更新根 README、相關元件 README 與 `docs/`。
- 競賽專案若有 `docs/competition.md`，同步維護問題、對象、展示流程、證據來源、限制與提交清單。

## 資料、秘密與授權

- 真實 API key、token、secret、password、private key、cookie、憑證、Webhook URL、production `.env`、個資與未公開資料不得寫入程式、文件、log、commit 或範例。
- `.env.example` 只保留變數名稱與安全 placeholder；前端或 App 可見的設定不得被當成秘密，敏感操作必須由可信任後端或平台執行。
- 合約、協議、報價、法務／商業文件、客戶或學生個資預設不提交；若專案確實需要公開的競賽文件，先逐檔確認內容與授權。
- 使用資料集、模型、圖片、字型、套件或程式碼前確認來源、授權與競賽規則；README 記錄必要 attribution，不自行選擇 LICENSE。

## Git、Commit 與 Pull Request

- 全新專案初始化的固定例外是：執行 `git init -b main`，安全掃描通過後只 stage 初始化產物，並建立 `chore(init): 初始化學生專案結構`。既有 Git repository 不適用此例外。
- 除上述固定初始 commit 外，只有使用者明確要求時才可 commit、push、建立 PR、merge、release 或部署；各項授權彼此獨立。
- 每次 branch、commit、merge、push 或 PR 前，先執行 `git status --short --branch`、`git branch --show-current` 與 `git remote -v`，確認目前分支、working tree、變更範圍、remote 與本次授權。
- **未設定 remote**：只執行本機 branch、commit 與 merge；不得虛構 push 或 PR，也不得自行建立 remote 或 GitHub repository。
- **已設定 remote**：遵守遠端保護規則；GitHub 團隊專案預設推送任務 branch、建立 Pull Request、完成檢查後 squash merge，再同步本機 `main`，不得直接 push `main`。
- 使用者只要求 `commit` 時，只提交目前任務中可獨立理解的 checkpoint，並**維持在目前分支**；不得 merge、刪除 branch、push、建立 PR、release 或 deployment。
- 使用者要求**合併進 `main`**時，視為目前任務收尾；安全檢查後可提交同一任務必要且範圍清楚的剩餘變更，再安全合併並驗證 `main`。若混有無關或不明變更，停止並詢問。
- 「合併進 `main` 並 push」可授權必要 commit、merge 與遠端同步，但**不代表已授權部署**或 release；仍須依 remote 模式使用既有安全流程。
- 合併成功、`main` 驗證通過，且任務 branch 已完整合併、沒有獨有 commit 或待續工作時，才使用 `git branch -d <branch>`；**不得使用 `git branch -D`**。Conflict、驗證失敗、dirty worktree 或任務未完成時保留 branch。
- 成功關閉後回到 `main`；**下一個獨立任務**從最新 `main` 建立新 branch，不混入已完成任務。
- commit 採 Conventional Commits：`<type>(<scope>): <繁體中文描述>`；`type`／`scope` 維持英文，Commit subject 描述與 Commit body 預設使用繁體中文，一次提交只包含一個可理解、可回滾的目的。
- Pull Request title 使用 `<type>(<scope>): <繁體中文描述>`，Pull Request 內文使用繁體中文並記錄目的、範圍、驗證、文件同步、風險、資料／環境、部署與 rollback 影響。
- 建議類型：`feat`、`fix`、`docs`、`chore`、`refactor`、`test`、`build`、`ci`、`style`、`perf`、`revert`。
- 提交前必須檢查 staged、unstaged、untracked 與 diff，排除秘密、`.env`、憑證、個資、內部文件、合約、報價與其他不應提交內容。
- 發現敏感內容時不得 commit 或 push：先 unstage、更新 `.gitignore`、改用 `.env.example`／placeholder；疑似外洩的憑證需提醒輪替。不確定檔案性質時先詢問。
- 只 stage 明確路徑，不使用 `git add .`；不得直接 push 到 `main`，團隊專案以短期 branch、PR 與通過的檢查交接。

## 部署與交接

- 部署不是初始化的一部分；未經明確要求，不建立 Coolify／雲端資源、資料庫、DNS、bucket、secret、release 或 production 連線。
- 有 `docs/deployment.md` 時以其為部署依據；設定尚未驗證時保持「尚未驗證」，不得複製其他專案的 port、domain、Docker 或 healthcheck。
- 交接給學生前，確認 README 能說明目前能做什麼、如何啟動與驗證、已知限制、環境變數來源、部署狀態及下一步。

## 完成回報

- 回報變更分類、變更檔案、行為差異、實際執行的驗證與結果、同步的 README／docs／元件文件、未驗證事項、剩餘風險及需要人工決定的項目；若沒有文件變更，說明理由。
