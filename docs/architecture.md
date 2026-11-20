# 系統架構與元件邊界

## 架構原則

- Repository 預設為單一 Git repository，只有根目錄可擁有 `.git/`。
- `web/`、`app/`、`cms/`、`backend/`、`worker/` 等 component 本身就是 framework root；manifest 與 lockfile 直接位於該目錄。
- 不建立 project-name 或 framework-name wrapper。跨 component 共用程式碼只有在至少兩個真實使用者存在時才放入 `packages/`。
- 未指定技術時採公司基線：Node.js 24 LTS、TypeScript、pnpm、Next.js、React Native with Expo、Payload CMS、NestJS 與 PostgreSQL。
- 學生因競賽、既有 starter、硬體、授權或團隊能力採不同技術時，以核准 Profile 記錄的選型為準。
- 本機 Docker Compose project 固定為 `carekitchen`。
- 主要 Compose 檔明確設定頂層 `name: carekitchen`，service 使用責任角色且原則上不設定 `container_name`。



## 已核准元件

- `web/`：Web 前端；framework=`Next.js`；package_manager=`pnpm`；technology_source=`company-default`。

## 結構例外

無；使用公司固定 component root。

## 跨元件與信任邊界

- UI 可見性不是授權；秘密、資料庫、重要外部 API 與高風險操作由可信任的 backend／platform 邊界持有。
- 新增 component、改變 framework／runtime／package manager、移動責任或建立新的外部服務前，先更新本文件與 Profile 並取得批准。

## 專案限制

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
