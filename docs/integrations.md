# CareKitchen｜OpenAI 串接

## 實作

- `web/lib/server/openai.ts` 使用官方 Node SDK 的 Responses API，以 Structured Outputs 回傳意圖與既有候選 ID。預設模型為 `gpt-4.1-mini`，提示詞版本為 `carekitchen-v1`。
- 每次模型呼叫只送本輪文字、角色、份量、餐數、設備、偏好、排除食材與候選摘要。費用計算、本機庫存與完整聊天紀錄留在模型呼叫之外。Responses API 請求設定 `store: false`。
- 逾時 12 秒，不自動重送。每個執行程序每分鐘最多 20 個模型請求，並行最多 3 個。分散式配額與公開展示帳戶預算仍待部署前確認。
- 無金鑰的預設模式為本機規劃。OpenAI 啟用後，上游失敗會清楚提示重試。明確醫療問題與可判定需由使用者確認的條件由本機直接回應。
- 真實金鑰只應存放在伺服器的 `.env.local` 或部署機密設定。變數和模式見 [Web README](../web/README.md)。

## 真實 API 驗收待辦

取得既有授權金鑰後，以合成案例逐一確認三角色、條件修改、OpenAI 回覆的模型欄位及逾時／配額錯誤。保留可公開的輸出與實際模型 ID，另依競賽測試計畫重跑。現有測試使用模型替身驗證介面，真實呼叫與金額尚未驗證。

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini)
