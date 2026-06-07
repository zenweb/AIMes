# Review: AuditLogBoard 审计日志列表失败浏览器证据

未发现本轮新增逻辑的阻断问题。该片修复的是审计日志表格本体静默 fallback，不改变审计回放面板已有逻辑。

## 核查

- 列表 API 失败时不再静默展示本地演示日志。
- 告警使用 `role="alert"` 和 `aria-live="assertive"`，能被辅助技术感知。
- 详情 API 失败时不会打开空详情弹窗，用户可见失败原因。
- Chromium 用例确认请求真实命中 `/api/v1/audit-logs`。

## 剩余风险

- 本轮未全量重跑 `audit.spec.ts`。
- B 轨发布闸门仍未关闭，不能把本片视作安全签字或发布完成证据。
