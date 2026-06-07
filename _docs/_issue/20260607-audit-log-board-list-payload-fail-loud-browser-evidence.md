# 2026-06-07 Issue - 审计日志列表非数组载荷未 fail-loud

## 问题

`/api/v1/audit-logs` 返回 200 且 `items` 为 `{ rows: [] }` 这类非数组载荷时，审计日志列表入口没有明确 fail-loud。单元红灯中页面尝试渲染坏日志项并触发 `log.action.toLowerCase()` 错误。

## 根因

`AuditLogBoard.load()` 在列表接口成功后缺少 `result.items` 数组校验，直接把响应写入 `logs`。

## 影响

审计日志列表是审计页面的主入口。坏列表载荷如果渲染成坏表格或触发渲染错误，会削弱审计页面的可信度和可诊断性。

## 处理

- 为 `load()` 增加运行时数组校验。
- 非数组载荷抛出 `后端返回非数组审计日志载荷`。
- 新增组件单元和真实 Chromium e2e。

## 状态

已通过组件定向单元和真实 Chromium e2e。
