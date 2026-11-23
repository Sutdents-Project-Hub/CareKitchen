# 來源、確認程度與設計決策對照

> 目的：讓學生、指導者、Codex／Claude 知道每項需求來自哪裡，避免把「原始發想」「研究建議」「本次技術提案」混為既有成果。

## 1. 需求來源

- 原始產品構想提供定位、三個角色、核心功能、安全界線及 V1–V3 研究方向。
- 競賽整理指南提供賽道、評分、交件、對話證據、時程與學生貢獻要求。
- 整理後的開發規格收錄於本目錄。原始附件為本機備查資料，未納入 Git。

## 2. 本次整理產出的規格

| 文件 | 性質／權威範圍 |
|---|---|
| `docs/project-overview.md` | 總覽、階段、P0 邊界 |
| `docs/product-spec.md` | Persona、功能 ID、可觀察驗收／禁止能力 |
| `docs/architecture.md` | 技術與單一 Web 元件、責任邊界 |
| `docs/agent-design.md` | AI Agent 角色、狀態、成本和安全策略 |
| `docs/prompts/system-draft.md` | **尚未測試**的提示詞初稿 |
| `docs/api-and-data-contracts.md` | 現有 API 契約及持久化與匿名分享規劃 |
| `docs/ux-and-user-flows.md` | UI 流程、易讀與無障礙目標 |
| `docs/evaluation-and-iteration.md` | 實測方法、Baseline、30 案例、評分 |
| `docs/competition.md`／`docs/demo-script.md` | 提交與 Demo 證據 |
| `docs/implementation-roadmap.md`／`docs/handoff-for-codex-claude.md` | 依序實作與交接 |

## 3. 確認程度

- **原始企劃已確認的需求方向**：目標人群、食材／預算／明確限制下的餐點對話、簡易說明、採買與三角色差異。
- **官方賽道要求**：2026-11-23 已核對 1 份 PDF、至少 10 則交換訊息、三種有差異的使用者、可操作助理與評分權重。 [活動頁](https://www.waicy.org/waicy-2026/) · [官方手冊](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf) · [評分表](https://www.waicy.org/rubrics/)
- **已實作**：Next.js、TypeScript、Node.js 24、pnpm、Zod、Node.js 測試及 OpenAI adapter。已保留 GPT-6 Luna 合成案例實測。託管方案待確認。
- **仍未確認**：部署平台、正式資料保存政策、真實使用者驗收、公開環境成本與競賽提交是否成功。

## 4. 禁止虛構的證據

- 說「已完成 30 案例」「V3 通過率 90%」「藥師驗證」「正式運行」「營養精準符合」都需要可追溯證據；目前一概**沒有**。
- 學生的實際貢獻要按開發紀錄揭露，不因使用 AI 工具就自動推定學生獨立編寫程式。

## 5. 官方參考網址（由原始指南提供，提交前重新驗證）

- https://www.waicy.org/waicy-2026/
- https://www.waicy.org/rubrics/
- https://www.waicy.org/2026-submission/
- https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf

若官方規則與這份指南不符，記錄差異與查核日期，更新 `docs/competition.md`、`docs/demo-script.md` 及交件清單後再決定處理方式。

## 6. 開發與介面來源

- [UI UX Pro Max，nextlevelbuilder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) 的設計系統與可及性查詢（修訂 `6ec2bb5`）用於配色、響應式表單、鍵盤焦點與觸控範圍檢查。
- [unslop，Damir Sokolovsky（@heydamir）](https://github.com/heydamir/unslop) 的版面檢查指引（修訂 `620163e`，[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)）用於留白、階層、材質與圖像取捨。
- 介面使用 [Lucide](https://lucide.dev/) 的操作圖示。餐點庫為本專案撰寫。
- OpenAI 和 Next.js 技術文件見 [OpenAI 串接](integrations.md) 與 [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation)。
- 網站自託管 [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4) 與 [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) 的拉丁變體，兩者均採 SIL Open Font License，授權檔隨字型存放於 `web/app/fonts/`。
