# 2026-06-07 AuditDecisionReplayPanel 配置审批失败 fail-loud Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理配置审批接口失败的证据。
- 约束：不扩新功能，只修复既有发布签字路径的可靠性和证据完整性。

## 发现

- `AuditDecisionReplayPanel` 单元测试已覆盖 `readAgentConfigApprovalsBackendFirst` 抛错时的 `配置审批加载失败` 告警。
- 真实浏览器红灯显示：`/api/v1/scheduling/agent-config-approvals` 返回 503 时，页面没有 `.replay-sync-alert`。
- 根因：`queryAgentConfigApprovals()` 在 API 层 catch 后返回 `[]`，导致审计回放组件无法感知配置审批加载失败。

## 处理

- `queryAgentConfigApprovals(take, { failLoud })` 支持 fail-loud 模式，默认仍保持旧的空数组 fallback。
- `readAgentConfigApprovalsBackendFirst({ failLoud })` 透传 fail-loud 选项。
- `AuditDecisionReplayPanel` 读取配置审批时启用 `{ failLoud: true }`，让发布签字相关失败进入 `recordReplaySyncError('配置审批', error)`。
- 新增 e2e：`配置审批接口失败时真实浏览器保留基础回放并告警`。

## 证据

- 红灯：新增 e2e 首次运行失败，真实 Chromium 下没有 `.replay-sync-alert`。
- 绿灯：修复后同一 e2e 通过。
- 页面验证：
  - 基础回放卡片 `WO-RUSH-9001 急单插入重排建议` 仍可见。
  - 待审批数显示 `0 个配置待审批`。
  - `.replay-sync-alert` 展示 `配置审批加载失败`。
  - 告警包含 `agent config approvals unavailable from chromium`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/agent-config-approval-sync.test.ts
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "configuration approvals fail to load"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "配置审批接口失败"
```

结果：同步工具单元 `5 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
