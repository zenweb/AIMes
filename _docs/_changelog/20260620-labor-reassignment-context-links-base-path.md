# 2026-06-20 人员替班关联链接 Base Path 修复

## 变更
- 修复人员管理中“替班/停工复核”帮助区的跨模块链接。
- 链接从根路径 `/production`、`/scheduling`、`/audit-logs` 改为当前应用可访问的 `/scheduling/production`、`/scheduling/scheduling`、`/scheduling/audit-logs`。

## 验证
- `npm run test:unit -- tests/unit/skill-matrix-panel.test.ts tests/unit/employee-board.test.ts`
- `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts`
- `npm run build`
- 真实浏览器员工页验证：
  - `生产开工 / Production` -> `/scheduling/production`
  - `AI 排产 / Scheduling` -> `/scheduling/scheduling`
  - `审计回放 / Audit trail` -> `/scheduling/audit-logs`
  - 页面无 Offline demo 或加载失败文案。
