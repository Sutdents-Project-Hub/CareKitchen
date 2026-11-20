# web 元件

## 元件責任

- 類型：Web 前端
- 專案：CareKitchen｜長者 AI 餐點顧問
- 本元件只負責與其執行環境及部署生命週期一致的功能。

## 技術證據

- 技術：Next.js
- Framework：Next.js
- Package manager：pnpm
- Manifest／入口：尚無（scaffold 規劃階段）

## 本機開發

目前只建立元件邊界與文件，尚未執行 framework bootstrap、依賴安裝或啟動。請使用官方 initializer 建立骨架後再補上並驗證前置需求、安裝、啟動、port 與本機 URL。

## 品質與建置

- Manifest 中可見的 script 名稱：`lint`、`typecheck`、`test`、`build`
- 只把實際執行成功的 lint、typecheck、test、build 指令寫入本文件。

## 環境變數

以本元件的 `.env.example` 記錄名稱與安全 placeholder；不得提交真實值。

## 部署與限制

- 部署狀態：已規劃，平台尚未確認
- 跨元件資料、API、權限或秘密邊界需在根 README 或 `docs/` 說明。
