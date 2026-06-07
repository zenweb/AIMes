# 2026-06-07 Issue - 业务落库审计详情非详情对象展示低质量错误

## 问题

`/api/v1/audit-logs/{id}` 返回 200 且载荷为 `{ items: [] }` 这类非详情对象时，真实浏览器中的审计回放告警展示 `undefined 审计载荷缺失`，没有明确说明后端审计详情载荷形状错误。

## 根因

`readBackendAgentActionAudits()` 在详情接口成功后缺少 `AuditLogDetail` 基本形状校验，直接把响应传给 `parseAgentActionAuditPayload()`。

## 影响

业务落库审计详情是 Agent 执行业务写入证据链的核心入口。坏详情载荷如果失去原始审计 id，会削弱审计回放对后端异常的可诊断性。

## 处理

- 为业务落库审计详情读取增加运行时基本形状校验。
- 非详情对象抛出 `${auditId} 后端返回非对象审计载荷`。
- 新增组件单元和真实 Chromium e2e。

## 状态

已通过组件定向单元和真实 Chromium e2e。
