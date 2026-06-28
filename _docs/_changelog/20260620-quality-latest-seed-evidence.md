# 2026-06-20 质量 latest 证据种子恢复

## 变更
- 为集成测试与 Docker PostgreSQL 当前库补齐三条质量证据链 latest 种子：
  - `QualityReworkImpact` / `quality-rework-impact-integration-current`
  - `QualityMrbDisposition` / `quality-mrb-disposition-integration-current`
  - `QualityCapaClosure` / `quality-capa-closure-integration-current`
- 新增 `QualityLatestEvidence_ShouldReturnSeededAuditableRecords`，锁定三个 latest endpoint 必须返回可审计记录。
- 更新 `db/ensure-current-schedule-plan.sql`，当前 Docker staging 数据可重复恢复。

## 验证
- RED：新增测试先失败于 `/quality-rework-impact/latest` 404。
- GREEN：同一测试通过。
- Docker SQL 执行：`INSERT 0 3`。
- 直连 API：三个 quality latest endpoint 均返回 200。
- 真实浏览器：`/scheduling/report`、`/scheduling/audit-logs`、`/scheduling/quality` 中 quality latest 请求均为 200，无 `请求错误`、无 offline skip、无本地 fallback。
