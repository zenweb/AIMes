# 2026-06-07 AuditDecisionReplayPanel 业务落库审计载荷损坏 Chromium 证据

## 变更

- 新增 Audit e2e：`业务落库审计载荷损坏时真实浏览器保留成功回放并告警`。
- 验证后端审计详情成功返回但 `newValues` JSON 损坏时，页面 fail-loud 且不丢弃其他成功业务落库回放。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计载荷损坏"
```

结果：Nuxt production build passed，Chromium `1 passed`。
