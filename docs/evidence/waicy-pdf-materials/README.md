# CareKitchen｜WAICY PDF 截圖素材

2026-11-23 在本機使用 GitHub `main` 的 `2bfd020` 正式建置，透過 Chrome 實際操作。輸入為合成備餐案例。標為「即時 AI」的畫面均等到網站顯示回覆及餐點，並確認該次 API 回應的模型為 GPT-6 Luna（`carekitchen-v4)）。

[英文圖說 PDF](CareKitchen_WAICY_Screenshot_Appendix.pdf) 收錄下列畫面。PDF 為利閱讀取用部分畫面的重點區域，原始高解析度 PNG 均留在 `screenshots/`。

| 圖 | 畫面 | 可證明的行為 |
|---|---|---|
| 01 | [三角色入口](screenshots/01-role-selection.png) | 長者、照護者、家屬的入口與對話工作區。 |
| 02 | [長者收到第一輪回覆](screenshots/02-elder-live-first-reply.png) | 即時 AI。一人份、NT$100、只有電鍋，取得兩道候選。 |
| 03 | [對話中更新條件](screenshots/03-elder-live-condition-change.png) | 即時 AI。改兩人份、NT$80、排除蛋，仍使用電鍋。 |
| 04 | [價格尚未齊全](screenshots/04-elder-live-price-check.png) | 即時 AI。豆腐一包 NT$45 已納入小計，菜價仍待確認，未判定在預算內。 |
| 05 | [照護者的手機畫面](screenshots/05-caregiver-live-egg-exclusion.png) | 即時 AI。兩道候選均套用已確認的蛋排除，畫面保留人份與料理設備。 |
| 06 | [家屬預覽採買摘要](screenshots/06-family-live-shopping-preview.png) | 即時 AI。使用產生的三人份餐點，預覽庫存、待買與未查到的價格。 |
| 07 | [用藥安全問題轉介](screenshots/07-safety-professional-referral.png) | 伺服器規則。顯示專業確認提示，沒有餐點卡，也沒有送出模型請求。 |
| 08 | [十輪對話與英文指南](screenshots/08-waicy-transcript-and-guide.png) | 先前實測的唯讀紀錄。十輪中七輪有模型決策，其餘三輪由伺服器判定。 |
| 09 | [紀錄中的第六輪](screenshots/09-waicy-recorded-budget-round.png) | 先前實測的唯讀紀錄。顯示模型標示、英文摘要、原始問答及價格待確認。 |

PDF 正文建議優先選 **03（多輪更新）**、**04（費用透明）**、**06（家屬採買）**，並以 **09** 對照正式的 [十輪原始實測](../runs/luna-waicy-final-recheck.json)。
