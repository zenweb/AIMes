# 2026-06-07 AuditDecisionReplayPanel 助手动作审计坏载荷 fail-loud Chromium 证据

## 变更

- 修复助手动作审计 200 非数组载荷在审计回放中被静默 fallback 的问题。
- `queryAssistantActionAudits` 和 `readAssistantActionAuditsBackendFirst` 增加可选 `{ failLoud: true }`，默认调用保持原有 fallback 行为。
- `readAssistantActionAuditsBackendFirst` 增加运行时数组校验。
- `AuditDecisionReplayPanel` 在读取助手动作审计时启用 fail-loud。
- 新增 Audit e2e：`助手动作审计载荷非数组时真实浏览器保留基础回放并告警`。
- 新增助手动作审计工具单元测试覆盖 fail-loud 和非数组载荷。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/assistant-action-audit.test.ts
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "assistant action audit payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "助手动作审计载荷非数组"
```

结果：助手动作审计工具单元 `8 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
