# 2026-06-07 AuditDecisionReplayPanel 配置审批坏载荷 fail-loud Chromium 证据

## 变更

- 修复配置审批 200 非数组载荷在审计回放中展示 `find is not a function` 的问题。
- `readAgentConfigApprovalsBackendFirst` 增加运行时数组校验。
- fail-loud 模式下非数组载荷统一抛出 `后端返回非数组审计载荷`。
- 默认非 fail-loud 调用保持本地审批 fallback 行为。
- 新增配置审批同步工具定向单元测试覆盖非数组载荷。
- 新增 `AuditDecisionReplayPanel` 组件单元测试覆盖配置审批非数组载荷。
- 新增 Audit e2e：`配置审批载荷非数组时真实浏览器保留基础回放并告警`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/agent-config-approval-sync.test.ts -t "non-array backend approval payloads"
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "configuration approval payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "配置审批载荷非数组"
```

结果：配置审批同步工具定向单元 `1 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
