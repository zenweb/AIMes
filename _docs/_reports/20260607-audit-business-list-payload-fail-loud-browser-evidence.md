# 2026-06-07 AuditDecisionReplayPanel 业务落库审计列表坏载荷 fail-loud Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理业务落库审计列表 `items` 非数组载荷的证据。
- 约束：不扩新功能，只硬化既有 Agent 业务落库审计回放入口。

## 发现

- 已有真实 Chromium 证据覆盖业务落库审计接口失败、详情失败、详情载荷损坏、详情载荷缺失和未知业务资源。
- 缺口：审计列表接口返回 200，但 `items` 不是数组时，页面仍展示低质量 JS 错误。
- 红灯显示：
  - 单元测试告警为 `业务落库审计加载失败：page.items.map is not a function`。
  - 真实 Chromium 告警为 `业务落库审计加载失败：l.items.map is not a function`。

## 处理

- `readBackendAgentActionAudits()` 在读取 `getAuditLogs()` 返回后增加 `Array.isArray(page.items)` 校验。
- 非数组载荷抛出 `后端返回非数组审计载荷`。
- 新增组件单元：业务落库审计列表 `items` 非数组时保留基础回放并告警。
- 新增 e2e：`业务落库审计列表载荷非数组时真实浏览器保留基础回放并告警`。

## 证据

- 页面验证：
  - 基础回放卡片 `WO-RUSH-9001 急单插入重排建议` 仍可见。
  - 基础回放卡片 `M-AL-6061 收货后释放冻结工序` 仍可见。
  - `.replay-sync-alert` 展示 `业务落库审计加载失败`。
  - 告警包含 `后端返回非数组审计载荷`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "business-write audit list payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计列表载荷非数组"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
