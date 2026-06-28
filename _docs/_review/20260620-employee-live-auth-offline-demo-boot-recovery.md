# 2026-06-20 Review - 员工页真实登录态离线标记启动自愈

## 结论
- 通过。修复点集中在 auth 启动恢复路径，未扩展员工功能范围。

## 风险检查
- 保留 demo token 行为：`demo-token-*` 不会被强制关闭离线 demo。
- 真实 token 行为：缓存真实 token 时清理 stale offline 标记，避免 `/api/v1/employee` 被跳过。
- 仍保留员工页离线 demo 静默兜底能力：真正 demo 模式下不会把英文 skip 文案暴露给用户。

## 证据
- 单测 5 个文件共 68 条通过。
- 前端生产构建通过。
- 真实浏览器 stale 标记恢复场景通过。

