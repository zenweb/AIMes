# 2026-06-20 工程与 BOM latest 证据种子恢复

## 变更
- 补齐四条工程/BOM 当前证据链种子：
  - `BomKittingPackage`
  - `AlternateMaterialApproval`
  - `EngineeringChangeImpact`
  - `RouteCapabilityValidation`
- 新增 `EngineeringBomLatestEvidence_ShouldReturnSeededAuditableRecords`，覆盖 endpoint 200、payload 可审计、deterministic evidence key 存在。
- 更新 `db/ensure-current-schedule-plan.sql`，Docker PostgreSQL 当前库可重复恢复。

## 验证
- RED：新增测试先失败于 `/bom-kitting-package/latest` 404。
- GREEN：同一测试通过。
- Docker SQL：插入 4 条工程/BOM evidence。
- 直连 API：四个 latest endpoint 均返回 200。
- 真实浏览器：`/scheduling/scheduling` 四条工程/BOM latest 均 200，页面无 errors、无 `请求错误`、无 offline skip。
