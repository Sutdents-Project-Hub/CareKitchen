# CareKitchen｜長者 AI 餐點顧問

CareKitchen 為 WAICY 2026 第 4 賽道規劃。透過對話協助獨居長者、家庭照護者與家屬，按現有食材、採買預算、設備、份量與已確認的飲食限制，找出可以討論的家常餐點。

## 目前可用

- 三種角色共用餐點規劃流程，各自帶入示例與料理、備餐或採買的操作重點。
- 多輪調整份量、餐數、設備、食材、預算與排除項目，或直接編輯條件。規劃依原創家常餐點庫提出最多三個候選，附料理步驟與採買明細。
- 伺服器依使用者提供的包裝報價重算費用，標示未知份量與價格，跳過已知超預算及不符合明確條件的餐點。
- 可放大文字、切換簡易顯示，先預覽再複製採買摘要。用藥、疾病飲食處方及吞嚥問題會提示專業確認。
- 已實作伺服器端 OpenAI Responses API。缺少金鑰時預設以有明確標示的本機規則規劃。真實 OpenAI 呼叫、使用者研究、公開作品與競賽對話證據仍待驗證。

## 本機開發

唯一可執行元件為 [web/](web/README.md)，採 Next.js App Router、TypeScript、Node.js 24 LTS 與 pnpm 10。

```sh
cd web
pnpm install --frozen-lockfile
pnpm dev
```

預設入口為 `http://localhost:3000`。設定 OpenAI 時，將 `web/.env.example` 複製成同層的 `.env.local`，填入已授權的 `OPENAI_API_KEY`。預設模型為 `gpt-4.1-mini`，可用 `OPENAI_MODEL` 覆寫。詳細的執行模式與錯誤行為見 [Web 元件說明](web/README.md)。

在 `web/` 執行 `pnpm lint`、`pnpm typecheck`、`pnpm test` 和 `pnpm build`。規則與測試替身的檢查紀錄不能作為競賽模型評分。

## 文件

- [專案總覽](docs/project-overview.md) · [產品需求與驗收](docs/product-spec.md) · [實作路線圖](docs/implementation-roadmap.md)
- [系統架構](docs/architecture.md) · [API 與資料契約](docs/api-and-data-contracts.md) · [Agent 設計](docs/agent-design.md) · [OpenAI 串接](docs/integrations.md)
- [使用流程、配色與可及性](docs/ux-and-user-flows.md) · [安全與隱私](docs/security-and-privacy.md) · [資料保存](docs/data-and-storage.md)
- [實測計畫](docs/evaluation-and-iteration.md) · [Demo 腳本](docs/demo-script.md) · [競賽交件清單](docs/competition.md) · [部署計畫](docs/deployment.md)

GitHub 版本管理使用 [Sutdents-Project-Hub/CareKitchen](https://github.com/Sutdents-Project-Hub/CareKitchen)。公開展示平台待選。開發與交接依 [AGENTS.md](AGENTS.md)，來源及設計指引見 [來源紀錄](docs/source-register.md)。
