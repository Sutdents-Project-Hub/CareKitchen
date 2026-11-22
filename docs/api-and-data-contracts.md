# CareKitchen｜API 與會話資料契約

## 現有路由

| 方法 | 路徑 | 行為 |
|---|---|---|
| GET | `/api/chat` | 回傳 `{ mode }`，值為 `openai`、`local` 或 `unavailable` |
| POST | `/api/chat` | 驗證本輪訊息與條件，回傳新條件及餐點卡 |

POST 輸入為 `{ persona, text, context, previousMealIds? }`。角色為 `elder`、`caregiver`、`family`。完整型別在 `web/lib/contracts.ts`，輸入驗證在 `web/lib/server/turn.ts`。訊息最長 600 字元，請求最多 24 KiB。

`MealContext` 含份量、餐數、預算、庫存、已知包裝價格、已確認排除、設備、時間、偏好、限制待確認與僅用庫存。空值表示份量、預算、時間或數量未提供。可換算同單位的庫存與報價，單位為 `g`、`ml`、`個`、`份`。包裝報價包含食材名稱、每包數量、單位與每包總價。

成功回應包含 `mode`、`message`、`context`、`cards`、`responseType`、`unknowns`；實際有模型輸出時包含 `modelInfo`。成本由伺服器重新計算，回應狀態可為 `within`、`unknown` 或 `no_budget`；已知超預算的候選不回傳。錯誤回應為 `{ message }`，涵蓋無效輸入 400、來源限制 403、請求太大 413、錯誤格式 415、限流 429 與上游不可用 503。API 回應帶 `Cache-Control: no-store`。

## 會話與分享

聊天訊息和條件保存在當前瀏覽器分頁的 React 狀態。伺服器逐輪驗證資料，沒有跨請求的私人紀錄查詢。使用者可先預覽，再複製由餐點卡整理的採買文字。

公開唯讀對話仍在規劃。建立對話快照前需有預覽、去識別與同意。若採站內分享，應有高熵權杖、到期及擁有者撤回機制。持久化供應商、保存政策、費用及公開測試待確認，見 [存放規劃](data-and-storage.md) 與 [安全與隱私](security-and-privacy.md)。
