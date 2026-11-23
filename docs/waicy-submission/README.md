# WAICY 2026 英文簡報與提交素材

> 狀態：簡報初版已完成並檢查渲染，**尚未匯出正式 PDF**（依使用者指示，由使用者在 Claude 作品頁確認後自行匯出）。公開網址、對話分享連結、團隊資訊仍為待補欄位。

## 內容

| 檔案 | 用途 |
|---|---|
| [project-description.md](project-description.md) | 可貼進報名表的英文專案簡述（185 字，上限 200） |
| [rubric-mapping.md](rubric-mapping.md) | 官方七項評分與十項必填內容對應的頁面、證據與可加強處 |
| [submission-todo.md](submission-todo.md) | 提交前待補資料，含放置位置與是否阻擋提交 |
| [research-notes.md](research-notes.md) | 外部研究的來源、查證程度與已排除的數字 |
| `deck-source/` | 簡報的可編輯原始檔（Claude Slides 格式，26 頁） |

## 簡報

- Claude 作品（私人連結，只有擁有者可開）：https://claude.ai/artifact/4kcWQeX2UYXPjrXtPrSbbY
- 形式：Claude Slides（16:9、26 頁）。沿用專案既有的 Term Sheet 視覺（冷白底 `#F7F8FA`、深藍 `#16315C`、Source Serif 4＋IBM Plex Sans、無陰影與圖示），因此沒有採用帳號內的其他 Design System。
- 匯出：在作品頁使用 Share › Export 匯出 PDF。官方檔名：`LLM_High_CareKitchen.pdf`；Google Drive 資料夾：`LLM_High_CareKitchen`。**組別 High 需由團隊確認。**
- 圖片來源：`docs/evidence/waicy-pdf-materials/screenshots/` 的真實截圖（第 10、11、12 頁為裁切版，未修改內容）。截圖介面為繁體中文，頁面內以英文說明。

## 可編輯原始檔

`deck-source/project/` 內含 `deck.json`（頁序、字型）、`deck.css`（共用樣式）與 `slides/*.html`。投影片內的圖片以作品內部資源 ID（`/_blob/…`）引用，因此**只有在原 Claude 作品中才能顯示圖片**；若要另建新作品，需重新上傳截圖並替換 `src`。日常修改建議直接在 Claude 作品頁編輯。

## 簡報頁序

1 封面 · 2 摘要 · 3 動機與數據 · 4 通用聊天機器人的缺口 · 5 服務定義 · 6 使用流程 · 7 Agent 設計 · 8 三種使用者 · 9 同題三種回答 · 10 價格誠實 · 11 即時對話 · 12 安全界線 · 13 構想演進 · 14 提示詞版本 · 15 實驗結果 · 16–17 錯誤分析 · 18 新題測試 · 19 公開連結（待補） · 20 十輪紀錄 · 21 限制 · 22 倫理 · 23 未來發展 · 24 原創性與團隊貢獻（待補） · 25 結論 · 26 參考文獻
