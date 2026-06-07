# 2026-06-07 AuditDecisionReplayPanel 配置审批坏载荷 fail-loud Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理配置审批 200 非数组载荷的证据。
- 约束：不扩新功能，只硬化既有关键配置审批和质量推荐扩大门禁审计路径。

## 发现

- 已有真实 Chromium 证据覆盖 `/api/v1/scheduling/agent-config-approvals` 返回 503 时的 `配置审批加载失败` 告警。
- 真实浏览器红灯显示：`/api/v1/scheduling/agent-config-approvals` 返回 `{ items: [] }` 时，页面展示低质量错误 `find is not a function`。
- 根因：`readAgentConfigApprovalsBackendFirst()` 直接对后端返回值调用 `.find()`，缺少运行时 `Array.isArray` 校验。

## 处理

- `readAgentConfigApprovalsBackendFirst({ failLoud: true })` 增加非数组载荷检查。
- fail-loud 模式下非数组载荷抛出 `后端返回非数组审计载荷`。
- 默认非 fail-loud 调用保持既有本地审批 fallback 行为。
- 新增工具单元：配置审批后端返回非数组载荷时 fail-loud。
- 新增组件单元：配置审批非数组载荷时保留基础回放并告警。
- 新增 e2e：`配置审批载荷非数组时真实浏览器保留基础回放并告警`。

## 证据

- 红灯：
  - 工具单元初始失败，实际错误为 `backendRecords.find is not a function`。
  - 真实 Chromium 初始失败，页面告警为 `配置审批加载失败：t.find is not a function`。
- 绿灯：补运行时数组校验后，同一组定向验证通过。
- 页面验证：
  - 基础回放卡片 `WO-RUSH-9001 急单插入重排建议` 仍可见。
  - `.approval-badge` 显示 `0 个配置待审批`，避免坏载荷伪造待审批数量。
  - `.replay-sync-alert` 展示 `配置审批加载失败`。
  - 告警包含 `后端返回非数组审计载荷`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/agent-config-approval-sync.test.ts -t "non-array backend approval payloads"
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "configuration approval payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "配置审批载荷非数组"
```

结果：配置审批同步工具定向单元 `1 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
