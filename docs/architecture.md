# CareKitchen｜系統架構

## 目前實作

單一 `web/` Next.js App Router 專案，使用 TypeScript、Node.js 24 LTS 及 pnpm。頁面、伺服器端請求、餐點規劃及測試採同一依賴與部署邊界。

```text
瀏覽器（角色、條件、對話、餐點與採買摘要）
  → POST /api/chat（輸入格式、長度、來源及模式）
  → 使用者本輪意圖與明確條件解析
  → 家常餐點庫（份數、設備、排除、時間、庫存與整包成本）
  → OpenAI Structured Outputs（若啟用：分類與候選排序）
  → 以合格候選整理回應與待確認項目
```

| 路徑 | 責任 |
|---|---|
| `web/app/`、`web/components/` | 角色入口、對話與條件編輯、料理卡、採買摘要預覽和複製 |
| `web/app/api/chat/route.ts` | 請求邊界、設定、模型請求限流及錯誤訊息 |
| `web/lib/server/turn.ts` | Zod 驗證、條件更新、醫療與不確定性處理 |
| `web/lib/server/meals.ts`、`recipes.ts` | 原創家常餐點庫、食材與規則核對、庫存扣抵、費用試算 |
| `web/lib/server/planner.ts`、`openai.ts` | 組合回應與單一 OpenAI 介接，排序只能選既有合格 ID |
| `web/tests/` | 本機規則與模型替身回歸測試 |

每輪帶入上一次條件並套用本輪可辨識的變更。表單可明確修正未能辨識的條件或解除排除項目。伺服器重新核算費用及限制，瀏覽器只呈現回傳結果。現階段分頁重新載入後會清除會話。

## 部署與資料保存

公開展示、長期對話保存與快照分享仍待決定。展示的存放供應商、存取控制、到期、撤回與備份依 [資料保存](data-and-storage.md) 和 [部署計畫](deployment.md) 驗證。OpenAI 的模型、故障與限流契約見 [串接文件](integrations.md)。

## 競賽實測頁

`/evidence/waicy` 是隨 Web 編譯的唯讀頁，資料取自評估腳本的固定合成案例。頁面列出逐輪輸入、回覆及模型參與狀態。互動對話仍只留在當前分頁。 [實測紀錄](evidence/README.md)
