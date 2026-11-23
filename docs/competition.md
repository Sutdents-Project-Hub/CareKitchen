# WAICY 2026｜CareKitchen 第 4 賽道交件與評審作戰文件

> 資訊依使用者提供的研究指南和 2026-11-23 核對的官方活動頁、評分表、手冊及提交表單整理。團隊資格由參賽者確認。
> 參賽類別：LLM & AI Agent（AI as a Service），高中組；作品 CareKitchen。

本機已完成交件前新案例重測及十輪合成對話展示，附英文操作指南。英文報告草稿已整理實測、參考來源及表單用摘要。評審公開網址、學生貢獻、最終英文 PDF 與正式提交待備妥。 [英文報告草稿](waicy-report.en.md) · [實測紀錄](evidence/README.md)

## 1. 時程與官方入口

| 項目 | 內容 |
|---|---|
| 全球賽正式截止 | 2026-11-29 17:00 EST，台灣時間 2026-11-30 06:00 |
| 專案內部目標 | 2026-11-29 晚上前**提前完成**上傳，避開美東時間最後幾小時 |
| 決賽預期 | 2026-12-04 至 12-06，實際安排以主辦通知為準 |
| 官網 | https://www.waicy.org/waicy-2026/ |
| 官方賽道手冊 | https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf |
| 官方評分 | https://www.waicy.org/rubrics/ |
| 作品提交 | https://www.waicy.org/2026-submission/ |
| 主辦聯繫 | info@waicy.org |

資格、年齡分組、超過 5 人隊伍的規則及實際答辯時間，指南指出文件之間可能有差異；無法自行證實時向主辦確認。

## 2. 官方評分結構（100 分）

| 項目 | 分數 | CareKitchen 必須展示 |
|---|---:|---|
| Specific AI Service | 25 | 清楚服務定位、三角色、功能實際可操作 |
| Iterative Development | 25 | 初版 → 測試 → 失敗 → 修正 → 相同題目重跑，有原始輸出 |
| Motivation & Problem Statement | 10 | 長者餐點日常決策的真實痛點與需求依據 |
| Limitations & Considerations | 10 | 無法判定用藥安全、未知價格、個資保護、長者自主 |
| Future Development & Clear Reference | 10 | 可執行的後續方向及資料引用 |
| Presentation & Communication | 10 | 清楚英文說明與 Demo、回答評審問題 |
| Originality & Creativity | 10 | 將角色、預算、現有食材、限制與多輪互動結合的創意 |

最大風險是只交漂亮 Demo、沒有真實迭代證據；兩個 25 分項目合計 50%。

## 3. 正式一份 PDF 必備內容

1. Specific AI Service：CareKitchen 說明與實際核心功能。
2. User Profiles：至少三種需求不同的 Persona，示範個人化回答。
3. Motivation：為何需要這種專用顧問；標示已驗證與需求假設。
4. Chat History：**最終版 AI 至少 10 則交換訊息**的可讀取分享連結；保守準備**至少 10 個完整問答回合（約 20 則訊息）**，這是競賽準備建議，不冒充官方額外門檻。
5. Chatbot Link：評審可親自操作的真正 AI 顧問連結，非純影片或固定範本。
6. Iterative AI Design：以 [迭代開發紀錄](evidence/iteration-development.md)的 Prompt 原文、同題實測、錯誤分析與修正結果編寫。有原始 JSON 與操作畫面可回查。
7. Limitations：安全、未核驗價格、健康界線、倫理、隱私、未完成事項。
8. Future Development：語音、收藏、經審核的價格／營養資料等未來發展，清楚標示非 P0。
9. Conclusion：真實完成成果、效果與學生貢獻。
10. References：引用可追溯官方／研究／資料來源；不得把未查過的外部引用當正式資料。

賽道手冊列出的標準資料夾包含一份 PDF。下列頁數為排版參考。 [官方手冊](https://waicy-cdn.wholeren.cn/wp-content/uploads/2026/09/WAICY-2026-Guidebook.pdf)

## 4. 建議英文 PDF 頁面規劃（12 頁）

| 頁 | 章節 |
|---|---|
| 1 | CareKitchen / Project & Student / Track |
| 2 | Problem & Motivation |
| 3 | Specific AI Service & Unique Value |
| 4 | Three Personas / Personalization Strategy |
| 5 | Real User Journey & Agent Workflow |
| 6 | Baseline & First Prompt |
| 7 | Evaluation Dataset & Scoring Rules |
| 8 | Baseline & V1–V4 Results（直接基準採質性對照，應用同題檢查另附 V4 口語邊界） |
| 9 | Failure Analysis, Fixes & Retests |
| 10 | **Live Chatbot URL + Final Chat Transcript URL** |
| 11 | Limitations, Privacy, Safety & Future |
| 12 | Conclusion, Student Contributions & References |

第 8、9 頁可引用目前已完成的 16 回合同題比較、5 回合口語邊界檢查及原始失敗例。 [迭代開發紀錄](evidence/iteration-development.md)

### WAICY 簡報視覺規格

以下為使用者指定的 **Term Sheet** 主題原文，供後續製作簡報時套用至每一頁。這份規格適用於簡報；網站的對應設計見 [使用流程與無障礙設計](ux-and-user-flows.md)。

```text
Create a presentation in the 'Term Sheet' theme: a structured, institutional investor pitch deck that reads like the Sequoia pitch deck template, calm authority over flash. Background: flat cool white #F7F8FA on every slide, never a gradient. Typography: headlines in Source Serif 4, 40 to 64px, semibold, navy #0E1B33; section labels and all data in IBM Plex Sans, both Google Fonts. Body runs 16 to 18px in #41495A, labels are 11 to 13px uppercase letterspaced in #818A9C, and every stat number is IBM Plex Sans semibold, 40 to 52px, in navy #16315C. Layout: a visible structured grid with numbered sections, ruled tables and aligned columns built on white #FFFFFF cards with 1px #DDE2EA borders. Accents: navy #16315C carries headings, section numbers, table rules and bar fills only; one panel sits on primarySoft #DCE4F2. Strictly avoid: photos, icons, rounded blob shapes, drop shadows, more than one accent hue, decorative gradients, centered body paragraphs.

Use this theme for my slides. Ask me what the presentation is about first, then apply the theme to every slide.
```

## 5. Submission 資料夾和欄位

- 依官方手冊的命名格式，若確認報名高中組，Google Drive 資料夾用 `LLM_High_CareKitchen`，內放 `LLM_High_CareKitchen.pdf`。
- 2026-11-23 檢視表單包含國家、賽道、作品名、參加方式、最多 200 英文字的作品描述、聯絡資料、隊員資料、組別與任何人可閱讀的 Drive 資料夾連結。教師及地區主辦資料依實際情況填寫。團隊作品送出一份；如已由官方地區主辦完成登記，先向該主辦確認。 [官方提交表單](https://www.waicy.org/2026-submission/) · [英文摘要](waicy-report.en.md#project-description-for-the-submission-form)
- 交件 PDF 裡的兩個網址要獨立驗證：① AI 顧問可操作 ② final chat history 可讀。
- 打開無痕視窗和其他裝置測試共用權限、付費牆、登入要求、資料到期及平台限流。
- 送件後保存實際成功畫面／確認信；不可只根據表單送出按鈕認定已受理。

## 6. 交件前關卡（未完成不可勾）

- [ ] 學生報名資格及官方截止資訊再次確認
- [x] 三角色有可比較的本機同題回覆
- [x] 本機十輪合成對話保留中途條件並在缺少必要資料時追問
- [x] 固定案例檢查未知價格、整包超支及專業轉介
- [ ] 30 題或實際完整評估案例已執行，結果與證據可查
- [x] 至少一個失敗 → 修正 → 同題重測有真實紀錄。[逐案證據](evidence/iteration-development.md)
- [ ] **最終版**至少 10 輪完整真實問答已匿名、分享連結可讀
- [ ] 作品網址可在無痕視窗操作且不需學生私人帳號
- [ ] 英文草稿補上經核實的學生貢獻與兩個公開連結，匯出最終英文 PDF
- [ ] Drive 分享權限與 PDF 內連結逐一通過外部測試
- [ ] 確認信或提交成功截圖保存

## 7. 評審最可能追問

Q: Why not just ChatGPT?
A: 不主張「一定比 ChatGPT 強」，而是用相同模型／案例的實測數據展示角色化、硬限制保存、成本透明和風險降級的改善。

Q: What did the student build?
A: 明列學生本人完成問題研究、Prompt 迭代、案例設計與評分、修正決策；網站程式／翻譯／排版若由 Codex、Claude 或指導者協助，亦誠實揭露。

Q: What happens when your AI is wrong?
A: 顯示限制、追問未知條件、對高風險問題轉介專業、透過 server validator 和失敗測試迭代降低風險，但不保證完全無錯。

## 8. 最終 Demo 情節提綱

- Case 1：長者豆腐、青菜、100 元、電鍋 → 追問必要條件 → 2 道候選（不能捏造價格）。
- Case 2：「不要蛋、改兩人份、預算 80」→ 原條件保留並重新計算。
- Case 3：照護者提供已確認不宜的食材 → 回覆區分已套用限制與待確認。
- Case 4：家屬要採買摘要 → 分清已有、待買和未知價格。
- Case 5：藥物與食物安全問題 → 不提供判定，轉藥師／醫師。
- 評審看得到真實操作、真實回覆、真實失敗或未知狀態，才是可信作品。

對話**示範腳本**不是「已取得的十輪 final transcript」，必須由最後部署版本實際跑出後再提供。詳見 `docs/demo-script.md`。

## 9. 英文簡報與提交素材

2026-11-23 已完成 26 頁英文簡報（Claude Slides）初版，尚未匯出正式 PDF；公開網址、QR、對話分享連結、隊名與學生貢獻仍待補。簡報、評分對照、待補清單、報名表英文簡述與研究筆記見 [waicy-submission](waicy-submission/README.md)。
