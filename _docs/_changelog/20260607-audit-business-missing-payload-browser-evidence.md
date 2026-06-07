# 2026-06-07 AuditDecisionReplayPanel 业务落库审计载荷缺失 Chromium 证据

## 变更

- 新增 Audit e2e：`业务落库审计载荷缺失时真实浏览器保留成功回放并告警`。
- 验证后端审计详情成功返回但 `newValues` 缺失时，页面 fail-loud 且不丢弃其他成功业务落库回放。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "payload is missing"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计载荷缺失"
```

结果：单元定向用例通过；Nuxt production build passed，Chromium `1 passed`。
