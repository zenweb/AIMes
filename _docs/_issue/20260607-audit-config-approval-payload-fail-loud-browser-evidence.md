# 2026-06-07 Issue - 配置审批非数组载荷展示低质量错误

## 问题

`/api/v1/scheduling/agent-config-approvals` 返回 200 非数组载荷 `{ items: [] }` 时，真实浏览器中的审计回放告警展示 `find is not a function`，没有明确说明后端审计载荷形状错误。

## 根因

`readAgentConfigApprovalsBackendFirst()` 缺少运行时数组校验，直接对后端返回值调用 `.find()`。

## 影响

配置审批记录影响关键配置变更和质量推荐实验扩大门禁。坏载荷如果只暴露低质量 JS 错误，会削弱审计回放对发布签字链路的可诊断性。

## 处理

- 为配置审批 backend-first 读取增加运行时数组校验。
- fail-loud 模式下非数组载荷抛出 `后端返回非数组审计载荷`。
- 新增工具单元、组件单元和真实 Chromium e2e。

## 状态

已通过配置审批同步工具定向单元、组件定向单元和真实 Chromium e2e。
