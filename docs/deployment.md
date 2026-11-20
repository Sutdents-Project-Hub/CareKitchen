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
