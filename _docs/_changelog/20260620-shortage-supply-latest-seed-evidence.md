# 2026-06-20 缺料与供应 latest 证据种子恢复

## 变更
- 补齐四条当前缺料/供应证据链种子：
  - `ShortageKittingEvent`
  - `ShortageRiskResolution`
  - `SupplyRiskEscalation`
  - `SupplierNetworkDecision`
- 新增 `ShortageSupplyLatestEvidence_ShouldReturnSeededAuditableRecords`，覆盖 endpoint 可用性与 deterministic evidence key。
- 更新 `db/ensure-current-schedule-plan.sql`，Docker PostgreSQL 当前库可重复恢复。

## 验证
- RED：新增测试先失败于 `/shortage-kitting/latest` 404。
- GREEN：同一测试通过。
- Docker SQL：插入 4 条缺料/供应 evidence。
- 直连 API：四个 latest endpoint 均返回 200。
- 真实浏览器：
  - `/scheduling/dashboard`：`shortage-risk-resolution/latest` 200，无 errors。
  - `/scheduling/scheduling`：四条 shortage/supply/supplier latest 均 200。
  - `/scheduling/purchase`：`supply-risk-escalation/latest` 与 `supplier-network-decision/latest` 均 200，无 errors。
