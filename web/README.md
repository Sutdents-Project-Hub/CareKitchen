# CareKitchen Web

單一 Next.js App Router 元件，包含繁體中文 Web 介面、`/api/chat`、OpenAI 串接、家常餐點庫與價格檢查。專案使用 Node.js 24 LTS、pnpm 10、Next.js 16 及 TypeScript。依賴版本以 `package.json` 與 `pnpm-lock.yaml` 為準。

## 啟動與驗證

在 `web/` 執行以下指令。開發伺服器預設為 `http://localhost:3000`。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

## AI 模式

| 設定 | 行為 |
|---|---|
| `CAREKITCHEN_CHAT_MODE=auto`（預設） | 有金鑰時使用 OpenAI，缺少時由本機規則規劃 |
| `CAREKITCHEN_CHAT_MODE=local` | 全程使用本機規則 |
| `CAREKITCHEN_CHAT_MODE=openai` | 必須設定金鑰，缺少設定時回應 503 |
| `OPENAI_API_KEY` | 伺服器端專案金鑰，填於本機 `.env.local` 或部署平台機密環境 |
| `OPENAI_MODEL` | 可覆寫，預設 `gpt-6-luna`。使用 Luna 時伺服器明確指定 `reasoning.effort: "none"` |

啟用 OpenAI 後，上游錯誤、反應逾時或不可解析會提示重試。介面上的本機規劃標示也會顯示哪些結果由本機規則產生。詳見 [OpenAI 串接](../docs/integrations.md)。

## 責任與驗收

- `app/` 與 `components/` 提供角色切換、同頁多輪對話、條件編輯、料理卡及採買摘要預覽。
- `lib/server/` 解析條件、限制候選及核算採買成本。OpenAI 只能分類意圖和排序既有候選。
- `tests/` 使用 Node.js 測試規則與模型替身。實際 OpenAI 合成案例、逐版差異與限制見 [實測紀錄](../docs/evidence/README.md)。公開環境的配額和可用性仍待確認。
- 會話跟隨當前分頁，採買摘要為手動複製文字。唯讀路由 `/evidence/waicy` 顯示整理好的十輪合成案例。公開部署、可分享的真人會話與競賽交件見 [實作路線圖](../docs/implementation-roadmap.md)。
