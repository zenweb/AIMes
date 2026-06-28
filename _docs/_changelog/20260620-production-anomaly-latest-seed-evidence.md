# 2026-06-20 生产异常 latest 证据补种

## 变更
- 为 `/api/v1/scheduling/production-anomaly-event/latest` 补齐可审计种子证据。
- 风险页与异常页不再因缺少生产异常 latest 记录触发 404 或前端降级。

## 验证
- 集成测试：`ProductionAnomalyLatestEvidence_ShouldReturnSeededAuditableEvent` 通过。
- Docker PostgreSQL 已应用 `db/ensure-current-schedule-plan.sql` 中的 `ProductionAnomalyEvent` 记录。
- 直接 API：`GET http://127.0.0.1:5003/api/v1/scheduling/production-anomaly-event/latest` 返回 200。
- 真实浏览器：
  - `/scheduling/risk` 请求生产异常 latest 返回 200。
  - `/scheduling/anomaly` 请求生产异常 latest 返回 200。
