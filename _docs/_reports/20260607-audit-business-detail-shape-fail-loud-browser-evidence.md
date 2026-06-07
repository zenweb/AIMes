# 2026-06-07 AuditDecisionReplayPanel 业务落库审计详情坏形状 fail-loud Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理业务落库审计详情 `200` 但返回非详情对象的证据。
- 约束：不扩新功能，只硬化既有 Agent 业务落库审计回放详情入口。

## 发现

- 已有证据覆盖业务落库审计列表失败、列表 `items` 非数组、详情接口失败、详情 `newValues` 损坏、详情 `newValues` 缺失和未知业务资源。
- 缺口：详情接口返回 `200`，但载荷是 `{ items: [] }` 这类列表壳时，页面把它当详情解析。
- 红灯显示：
  - 单元测试告警为 `业务落库审计详情加载失败：undefined 审计载荷缺失`。
  - 真实 Chromium 告警同样缺少原始审计 id 和详情对象形状错误说明。

## 处理

- `readBackendAgentActionAudits()` 在 `getAuditLogDetail(item.id)` 成功后增加详情对象运行时校验。
- 非详情对象抛出 `${item.id} 后端返回非对象审计载荷`。
- 新增组件单元：业务落库审计详情坏形状时保留成功回放并告警。
- 新增 e2e：`业务落库审计详情载荷非详情对象时真实浏览器保留成功回放并告警`。

## 证据

- 页面验证：
  - 成功业务落库卡片 `采购收货落库：PO-DETAIL-SHAPE-OK-001` 仍可见。
  - 卡片摘要 `MAT-DETAIL-SHAPE-6061 收货 14` 仍可见。
  - `.replay-sync-alert` 展示 `业务落库审计详情加载失败`。
  - 告警包含 `audit-agent-detail-shape-broken 后端返回非对象审计载荷`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "detail payload is not a detail object"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "详情载荷非详情对象"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
