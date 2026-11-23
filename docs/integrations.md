# CareKitchen｜OpenAI 串接

## 實作

- `web/lib/server/openai.ts` 使用官方 Node SDK 的 Responses API，以 Structured Outputs 回傳意圖與既有候選 ID。預設模型為 `gpt-6-luna`，提示詞版本為 `carekitchen-v4`。選用 Luna 時固定 `reasoning.effort: "none"`，以配合 250 token 的結構化回應上限。切換 `OPENAI_MODEL` 時依所選模型使用其預設設定。
- 模型呼叫送出本輪文字、角色、份量、餐數、設備、費用與料理時間上限、偏好、排除食材與已核對的候選摘要。整包成本、原始報價、完整庫存與聊天歷史由本機程式處理。Responses API 請求設定 `store: false`。
- 逾時 12 秒，不自動重送。每個執行程序每分鐘最多 20 個模型請求，並行最多 3 個。分散式配額與公開展示帳戶預算仍待部署前確認。
- 無金鑰的預設模式為本機規劃。OpenAI 啟用後，上游失敗會清楚提示重試。明確醫療問題與可判定需由使用者確認的條件由本機直接回應。
- 真實金鑰只應存放在伺服器的 `.env.local` 或部署機密設定。變數和模式見 [Web README](../web/README.md)。

## 真實 API 驗收

GPT-6 Luna 已使用於本機三角色、十輪合成案例及版本比較。回應中有 `modelInfo` 才代表這輪有實際模型決策。公開環境中的逾時、配額、費用上限與評審可及性需依部署設定驗收。 [實測資料](evidence/README.md)

- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
