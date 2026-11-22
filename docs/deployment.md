# 部署說明

## 目前狀態

- 目標平台：已規劃，平台尚未確認
- 初始化階段未建立任何外部資源，以下設定均為尚未驗證。

## 命名契約

| 用途 | 名稱 |
|---|---|
| GitHub repository／本機根資料夾 | `CareKitchen` |
| Project slug | `carekitchen` |
| 本機 Docker Compose project | `carekitchen` |


- 主要 Compose 檔若存在，頂層設定 `name: carekitchen`。
- Compose service 使用 `web`、`app`、`api`、`cms`、`backend`、`worker`、`postgres` 等角色，原則上不設定 `container_name`。

## 部署契約

- 本機 Compose 只供本機整合驗證，不作正式 production entrypoint。平台確認後，每個獨立部署 component 的 Dockerfile、port、healthcheck、環境變數責任、備份與 rollback 必須由部署文件依實際平台記錄。
- 明確記錄每個可部署元件的 base directory、runtime、install、build、start command、port 與 healthcheck。
- 以上內容只能從實際 manifest、Dockerfile、Compose 或平台設定驗證，不得複製其他專案數值。

## 環境變數與資料

- 只記錄變數名稱、用途、必要性與值的管理位置；不寫真實 secret。
- 若有資料庫、上傳或持久化資料，部署前補上備份、還原、遷移與刪除影響。

## 發布與回滾

- 記錄部署前品質檢查、人工驗收、版本識別、發布責任與可執行的回滾方式。
- 未經明確授權，不建立、修改或刪除 production 資源。

## CareKitchen 評審公開部署流程（規劃、尚未選平台）

1. 第一個目標是**評審在無痕視窗可以開啟並真正對話的 Web URL**，而不是 App 安裝或 production SLA。是否採用 Vercel、Coolify、其他 Node host 尚未決定。
2. 只需部署單一 `web/` Next.js 服務；若需持久化，另以獲核准的 managed PostgreSQL 或等效方案保存會話與只讀匿名分享。**目前沒有資料庫或部署 URL。**
3. 先確認 hosting 能執行所選 Node/Next.js 版本、Server Route Handlers、長回合會話、API timeout、速率限制、TLS/HTTPS，以及最低限度資料刪除。
4. Client 不可使用部署平台內網服務名稱來呼叫 AI provider；secret 只放在 Web 伺服器環境，不能進入 `NEXT_PUBLIC_*`。
5. 在決賽可用期間先驗證額度與 URL，有失敗則誠實顯示 AI 不可用狀態；不要用預錄文案冒充即時模型。
6. 有真人對話資料時，須有明確同意、刪除、備份／還原與發表範圍決策；不要直接把 private session 推送為 public share。
7. 部署驗收：以匿名瀏覽器完成 10 輪真實互動；修改預算與排除食材；專業問題適當轉介；分享快照可開、唯讀、可撤銷；錯誤頁不洩漏 secrets。
8. 交件後如要轉正式服務，必須重新檢查法規、風險、資料政策、營運成本；不能把競賽展示當正式醫療或長照系統。

**尚待填實際值：** Hosting／owner、base directory、install/build/start command、Node 版本、port、healthcheck、domain、環境變數、DB、備份與 rollback。未驗證前不要套用其他專案的 Coolify／Compose 值。
