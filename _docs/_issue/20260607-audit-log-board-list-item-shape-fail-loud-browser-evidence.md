# 2026-06-07 Issue - 审计日志列表单项坏形状未 fail-loud

## 问题

`/api/v1/audit-logs` 返回 200 且 `items` 为数组，但某条审计日志缺少 `action` 等关键字段时，审计日志列表入口没有明确 fail-loud。单元红灯中页面尝试渲染坏日志项并触发 `log.action.toLowerCase()` 错误。

## 根因

`AuditLogBoard.load()` 在列表接口成功后只校验 `items` 是否为数组，缺少对数组内单条日志对象的基本形状校验。

## 影响

审计日志列表是审计页面主入口。单条坏日志项如果触发表格渲染错误，会影响整页审计可用性和错误诊断。

## 处理

- 为 `load()` 增加单条 `AuditLog` 基本形状校验。
- 非日志对象抛出 `${auditId} 后端返回非对象审计日志载荷`。
- 新增组件单元和真实 Chromium e2e。

## 状态

已通过组件定向单元和真实 Chromium e2e。
