# 2026-06-20 Review - 员工页 demo 会话切回真实登录

## 结论
- 已确认根因不是后端或账号：后端 `5003` 登录与 `/api/v1/employee` 直连均正常。
- 根因是旧 demo 登录态在普通 login 入口被认证守卫视为已登录，导致用户无法重新走真实后端认证，员工页继续被离线 demo 拦截器跳过后端请求。

## 覆盖
- 新增 Vue Router 单测覆盖 stale demo session plain login recovery。
- 新增 Nuxt middleware 单测覆盖 production preview 下同一恢复路径。
- 真实浏览器覆盖旧 demo storage -> 普通登录 -> 真实员工列表读取链路。

## 风险
- 仅清理 `demo-token-*`，不影响真实后端 token 的登录跳转行为。
- 显式 demo URL 仍保留离线演示能力。
