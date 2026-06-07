# 2026-06-07 AuditDecisionReplayPanel 未知业务落库资源 Chromium 证据

## 变更

- 新增 Audit e2e：`业务落库审计资源未知时真实浏览器保留成功回放并告警`。
- 验证后端审计详情返回未知 `businessWrite.resource` 时，页面 fail-loud 且不丢弃其他成功业务落库回放。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计资源未知"
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "business-write resource is unsupported"
```

结果：Vitest 定向用例通过；Nuxt production build passed；Chromium `1 passed`。
