# 2026-06-07 AuditDecisionReplayPanel 配置审批失败 fail-loud Chromium 证据

## 变更

- 修复配置审批 API 失败在审计回放中被静默吞掉的问题。
- `queryAgentConfigApprovals` 和 `readAgentConfigApprovalsBackendFirst` 增加可选 `{ failLoud: true }`，默认调用保持原有 fallback 行为。
- `AuditDecisionReplayPanel` 在读取配置审批时启用 fail-loud。
- 新增 Audit e2e：`配置审批接口失败时真实浏览器保留基础回放并告警`。
- 新增同步工具单元测试覆盖 fail-loud 选项。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/agent-config-approval-sync.test.ts
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "configuration approvals fail to load"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "配置审批接口失败"
```

结果：同步工具单元 `5 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
