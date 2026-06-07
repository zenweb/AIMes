# 2026-06-07 Issue - 业务落库审计列表非数组载荷展示低质量错误

## 问题

`/api/v1/audit-logs?action=AgentExecutePurchaseAction` 返回 200 且 `items` 为非数组时，真实浏览器中的审计回放告警展示 `items.map is not a function`，没有明确说明后端审计载荷形状错误。

## 根因

`readBackendAgentActionAudits()` 缺少 `page.items` 运行时数组校验，直接对后端返回值调用 `.map()`。

## 影响

业务落库审计列表是 Agent 执行业务写入证据进入回放面板的入口。坏列表载荷如果只暴露低质量 JS 错误，会削弱审计回放对业务写入证据链的可诊断性。

## 处理

- 为业务落库审计列表读取增加运行时数组校验。
- 非数组载荷抛出 `后端返回非数组审计载荷`。
- 新增组件单元和真实 Chromium e2e。

## 状态

已通过组件定向单元和真实 Chromium e2e。
