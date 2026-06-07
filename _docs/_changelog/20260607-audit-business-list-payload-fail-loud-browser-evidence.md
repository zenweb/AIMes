# 2026-06-07 AuditDecisionReplayPanel 业务落库审计列表坏载荷 fail-loud Chromium 证据

## 变更

- 修复业务落库审计列表 200 非数组载荷在审计回放中展示 `items.map is not a function` 的问题。
- `readBackendAgentActionAudits` 增加 `page.items` 运行时数组校验。
- 非数组载荷统一抛出 `后端返回非数组审计载荷`。
- 新增 `AuditDecisionReplayPanel` 组件单元测试覆盖业务落库审计列表坏载荷。
- 新增 Audit e2e：`业务落库审计列表载荷非数组时真实浏览器保留基础回放并告警`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "business-write audit list payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计列表载荷非数组"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
