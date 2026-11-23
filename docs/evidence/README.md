# CareKitchen 實測與參賽證據

2026-11-23 以已授權的 OpenAI API 實際執行。本輪均為合成備餐情境，瀏覽器角色由代理扮演。真人參與、外部評審連結與正式送件仍待完成。

[WAICY 第 6 項迭代開發紀錄](iteration-development.md)收錄 Baseline 與 V1 至 V4 的 Prompt 原文、逐案測試、根因分析、修正結果與瀏覽器畫面。

交件前另跑 10 回合新案例，修正前 7／10，修正後 10／10。既有 16 回合完整重跑通過，首次執行的錯誤也有保留。 [交件前實測](iteration-development.md#6-交件前新案例與修正)

## 同題重跑

固定 [16 回合案例](cases/meal-dialogues.json) 涵蓋三角色同題、十輪長者對話、超支、明確過敏原和症狀轉介。單輪須通過該輪的所有預期檢查才計為通過。

| 版本 | 回合通過 | 個別檢查 | 模型參與回合 | 原始紀錄 |
|---|---:|---:|---:|---|
| V1 | 5 / 16 | 29 / 56 | 12 | [修正前](runs/luna-pre-fix.json) |
| V2 | 16 / 16 | 56 / 56 | 11 | [澄清、口語條件和超支修正](runs/luna-post-fix.json) |
| V3 | 16 / 16 | 56 / 56 | 11 | [三角色分流修正](runs/luna-v3.json) |
| V4 | 16 / 16 | 56 / 56 | 11 | [原始 V4 同題重跑](runs/luna-final.json) |

V4 另通過 [5 個安全邊界回合](cases/meal-edge-cases.json)，包括「無蛋／別加蛋」、壓低預算、免開火與更新為兩人。上述各次記錄都完成執行，模型參與以每輪紀錄中的 `modelInfo` 計數。固定案例的通過數適用於本輪工程驗收。 [安全邊界結果](runs/luna-safety-recheck.json)

## 直接 Luna 基準與代表案例

[直接 Luna 輸出](runs/luna-direct-baseline.json) 使用同一模型、相同案例文字與已填的情境資料。以一般對話呈現歷史，採最小繁體中文指令。CareKitchen 則使用角色資料、結構化條件與費用規則，因此以下採逐案質性對照。

- **COST-OVER-1。** 直接模型按食譜用量攤提包裝價，回覆約 NT$49 且未超支。CareKitchen 把整包採買支出納入，指出其他條件適用的候選已知採買小計最低 NT$120，超過 NT$100，暫停列出候選並說明可調整的條件。
- **DEMO-10-3／4。** V1 將「蛋先不要」存成「蛋先」，接著又留下原本的一人份和 NT$100。V4 保留原設備、改為兩人份和 NT$80，並排除蛋。
- **SAME-ELDER／CAREGIVER／FAMILY。** V4 同一題有各自的理由。長者看到兩個簡單選擇和能用到的庫存，照護者看到份量與條件核對，家屬看到採買項目與價格缺漏，並可預覽摘要。
- **ALLERGY-SYMPTOM-1。** 直接模型也能拒絕保證雞蛋安全。V4 由伺服器轉介，並阻止候選或把「追問」存成食材。

## 十輪對話

本機 `/evidence/waicy` 的唯讀頁取自 [交件前完整重跑](runs/luna-waicy-final-recheck.json)的 `DEMO-10`。十個問答回合共 20 則訊息，其中 7 輪取得 Luna 決策、3 輪由程式處理缺少設備、飲食限制待確認及用藥詢問。頁面保留繁中實測原文，另附英文摘要與操作指南。送件前須從外部驗證兩個連結。

## 重跑方式

在 `web/` 使用已授權的測試環境。兩種模式都會實際呼叫模型，輸出使用新檔名。

```sh
node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts app retest ../docs/evidence/runs/retest.json
node --conditions=react-server --env-file-if-exists=.env.local scripts/evaluate.ts baseline retest-baseline ../docs/evidence/runs/retest-baseline.json
```

記錄包含時間、模型、提示詞雜湊、輸入、應用回覆與模型決策。Git 參照欄位是這輪本機開發的基底，模型設定由版本與雜湊對照。正式評分、學生貢獻與真人驗收需要另外取得證據。
