# 2026-06-20 POC 证据治理 optional 404 空状态证据

## 变更
- 补齐 `poc-evidence-governance` 单测，明确客户工单导入与客户设备故障两个 optional latest 端点返回 404 时，治理聚合应返回空数组而不是抛出用户可见错误。
- 更新测试期望，锁定 optional latest 请求必须携带 `{ suppressErrorToast: true }`，避免全局 `请求错误` toast 干扰系统管理和审计回放页面。

## 验证
- `npm run test:unit -- tests/unit/poc-evidence-governance.test.ts tests/unit/customer-order-import-sync.test.ts tests/unit/equipment-risk-sync.test.ts tests/unit/admin-board.test.ts tests/unit/audit-decision-replay-panel.test.ts tests/unit/poc-evidence-api.test.ts tests/unit/equipment-evidence-api.test.ts`
- `npm run build`
- 真实浏览器验证：
  - `/scheduling/admin`
  - `/scheduling/audit-logs`
  - 两个页面均有真实 JWT，且本地预置 stale `aimes_offline_demo=true`。
  - `/api/v1/scheduling/customer-order-import/latest` 与 `/api/v1/scheduling/customer-equipment-fault/latest` 仍返回 404，但页面不展示 `POC 证据治理加载失败`、`请求错误` 或 `Offline demo mode skipped backend request`。

