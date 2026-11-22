# 實驗與參賽證據資料夾

> 初始化日期：2026-11-20。**目前尚無任何真實 LLM 實驗結果、受試者訪談結果或評審可公開的 final 對話連結。**

## 這裡未來存什麼

- `cases/`：固定案例 JSON／Markdown，包括多輪對話輸入、預期要點和案例版本；尚未建立。
- `runs/`：Baseline／V1／V2／V3 的匿名完整原始輸出，附 model、timestamp、prompt hash、case ID；**只能由真正執行結果產生**。
- `reviews/`：學生／評審者依固定 rubric 的評分、失敗分類與具體理由。
- `screenshots/`：真實畫面與演示證據，先移除個資、API key 與私人網址。
- `shared-transcripts/`：可公開、經同意、已匿名的最終版對話紀錄和連結清單。
- `reports/`：由實測可回算的統計與版本差異圖。

上述子路徑是**將來的建議**，本次不建立空資料夾。

## 每一次紀錄必要資訊

`caseId`、`version`、`model`、`promptHash`、`createdAt`、`inputTurns`、`rawOutput`、`gradingRubric`、`scorer`、`criticalFailure`、`notes`、`consentStatus`（如涉及真人）。

- 沒跑的案例不能寫成 Pass。
- 示範字串或人工撰寫的「理想回答」不得混入真實 runs。
- 若結果沒有重現，必須註明限制。
- 真實健康資料、學生個資、API key 不得放公開 Git；須經同意、去識別及分類後才能分享。
- 重要的迭代失敗紀錄應可追溯到 prompt 版本與後續修正 commit。

詳細程序見 `docs/evaluation-and-iteration.md`；WAICY 完整交件要求見 `docs/competition.md`。
