# 2026-06-07 AuditDecisionReplayPanel 业务落库审计详情坏形状 fail-loud Chromium 证据

## 变更

- 修复业务落库审计详情接口 `200` 但返回非详情对象时展示 `undefined 审计载荷缺失` 的问题。
- `readBackendAgentActionAudits` 增加 `AuditLogDetail` 运行时基本形状校验。
- 非详情对象统一抛出 `${auditId} 后端返回非对象审计载荷`。
- 新增 `AuditDecisionReplayPanel` 组件单元测试覆盖业务落库审计详情坏形状。
- 新增 Audit e2e：`业务落库审计详情载荷非详情对象时真实浏览器保留成功回放并告警`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "detail payload is not a detail object"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "详情载荷非详情对象"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
