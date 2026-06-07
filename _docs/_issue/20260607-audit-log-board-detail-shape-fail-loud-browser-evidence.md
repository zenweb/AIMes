# 2026-06-07 Issue - 审计日志详情非详情对象未 fail-loud

## 问题

`/api/v1/audit-logs/{id}` 返回 200 且载荷为 `{ items: [] }` 这类非详情对象时，审计日志详情入口没有明确 fail-loud。单元红灯中页面尝试渲染坏详情对象并触发 `detail.action.toLowerCase()` 错误。

## 根因

`AuditLogBoard.openDetail()` 在详情接口成功后缺少 `AuditLogDetail` 基本形状校验，直接把响应写入 `detail`。

## 影响

审计日志详情是审计页面的用户必经核查入口。坏详情载荷如果打开空/坏弹窗或触发渲染错误，会削弱审计页面的可信度和可诊断性。

## 处理

- 为 `openDetail()` 增加运行时基本形状校验。
- 非详情对象抛出 `${auditId} 后端返回非对象审计详情载荷`。
- 新增组件单元和真实 Chromium e2e。

## 状态

已通过组件定向单元和真实 Chromium e2e。
