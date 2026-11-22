# CareKitchen｜Codex／Claude 實作交接說明

> 現有 Next.js Web 原型可本機驗證。啟動方式見 `web/README.md`，OpenAI 真實執行、公開部署及競賽證據待確認。以下保留原先的開發順序供對照。

## 1. 專案位置與目的

- Repository 名稱必須是 `CareKitchen`，slug 為 `carekitchen`。
- 參賽：WAICY 2026 第 4 賽道 LLM & AI Agent（AI as a Service）。
- 願景：長者／照護者／家屬依現有食材、預算、設備、口味和使用者已確認限制，透過多輪問答選餐並整理採買。
- 原始需求在本機 `docs/inputs-private/`（刻意 Git 忽略，不能因有附件就直接公開）；規範與驗收以公開的整理文件為準。

## 2. 讀檔順序（不得跳過）

1. `AGENTS.md`：Git、安全、文檔同步、權限和變更流程。
2. `README.md`：專案現狀與目錄。
3. `docs/project-overview.md` ＋ `docs/product-spec.md`：P0／P1 邊界、AC。
4. `docs/architecture.md` ＋ `docs/api-and-data-contracts.md`：單一 Next.js 全端與狀態／分享契約。
5. `docs/agent-design.md` ＋ `docs/prompts/system-draft.md`：真正 Agent 行為。
6. `docs/ux-and-user-flows.md`：三角色情境與長者友善介面。
7. `docs/evaluation-and-iteration.md`、`docs/competition.md`、`docs/demo-script.md`：實測與交件。
8. `docs/security-and-privacy.md`、`docs/data-and-storage.md`、`docs/integrations.md`、`docs/deployment.md`：高風險與外部服務邊界。

## 3. 開發方式與架構禁區

- 根據公司學生初始化 Skill 的規則，`web/` 就是唯一 executable component 的 framework root。
- 以官方 Next.js initializer 在 `web/` 生成 TypeScript App Router skeleton；Node.js 24 LTS＋pnpm 為選型，版本相容性實際確認後寫入 docs。
- 先不要新建 `backend/`、`app/`、`cms/`、`worker/`、`packages/`、`database/`、Docker Compose 或 Coolify 資源。若有實際必要，先做架構決策與核准。
- 以 Next.js Route Handlers 實作 server-side AI adapter、constraint validator、會話／分享；browser 不可拿 API key，模型輸出不是可信計算。
- 不要加入會員登入、健康檔案、醫療建議、即時報價、圖片 OCR、語音或完整一週菜單。這些都是 P1 或排除項目。
- 先完成**真的可以連續對話**的最短路徑，才做非必要 UX polish。
- 應保留 deterministic 的費用與硬限制檢查，即使模型改為其他供應商也不改核心安全邊界。

## 4. 每個任務的實際做法

1. 先看 Git 三項：`git status --short --branch`、`git branch --show-current`、`git remote -v`。
2. 先檢查 workspace 是否有**本輪初始化新增、尚未 commit 的 docs**；保留並同步，不因未追蹤就刪除／覆蓋。
3. 說明本次要完成哪個 CK/AC、該碰哪些文件、如何觀察成功、失敗處理。
4. 使用小範圍改動；實作與自動測試同時進行，遇到 bug 記錄重現案例。
5. 變更產品行為、API、prompt、模型／平台、資料保存時，同一任務更新對應 docs 和 README。
6. 未經使用者後續明確指示，不 commit 額外變更、不 push、不建 GitHub remote、不外部部署、不填真實 key。
7. 原始 prompt／測試失敗不可覆寫：留版本、日期、模型、輸入、真實回覆及分數。
8. 回報已跑的檢查／結果、尚未驗證的項目、敏感資料風險和下一階段工作。

## 5. 初始實作任務（歷史紀錄）

~~~text
請先完整閱讀本 repo 的 AGENTS.md、README.md、
docs/handoff-for-codex-claude.md、docs/product-spec.md、
docs/architecture.md、docs/agent-design.md、
docs/implementation-roadmap.md、docs/evaluation-and-iteration.md。

這是 WAICY 2026 第 4 賽道的 CareKitchen，請依 CK-01～CK-05
開始執行 Phase P0-a，先在 web/ 以 Next.js 官方 initializer
建立 TypeScript + App Router + pnpm 的可執行骨架，維持 web/
為 framework root，不要新建 web/carekitchen/ 或獨立 backend/。
建完先驗證真正的 lint、typecheck、build 等現有指令，
並實作最小首頁三角色與聊天 UI，完成可重播的人工驗收。
這一輪不要加入會員、健康資料、付費 API、資料庫、雲端部署。
不要冒稱有可運作的 AI；真正串接 LLM 留在 P0-b 等取得核准設定。
請記錄實際版本、已執行命令、測試結果、修改的文件和 Git 狀態。
~~~

如果使用者明確授權「直接開始所有 P0」，才沿 `docs/implementation-roadmap.md` 逐階段推進；引入新的付費服務、存取真實個資或公開部署仍須依既有核准關卡。

## 6. 應回報的格式

- **完成**：哪個 TASK／CK／AC，在哪個路徑做了什麼
- **驗證**：命令、測試數、成功／失敗與輸出
- **文件**：改了哪幾份權威文件
- **Git**：branch、commit（若獲授權）、remote／未推送
- **風險**：醫療、價格、個資、配額、未決部署、模型效能
- **下一步**：下一個最小可驗收任務

## 7. 對學生工作的誠實揭露

評審可能問「程式誰寫的、Prompt 誰改的、測試誰評的」。請保留學生、指導者、Codex／Claude 各自實際貢獻。AI 協助產生程式與文件本身不是競賽成效證據；能解釋設計決策、真實錯誤、驗證與改進，才是學生作品核心。
