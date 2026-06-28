# Issue: 员工列表加载失败显示 Offline demo skip

## 现象
用户反馈员工列表显示：`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。

## 根因判断
- 旧逻辑会在 `aimes_offline_demo=true` 时由 HTTP 请求拦截器直接跳过后端。
- 当前代码已改成 token-aware：真实后端 token 不会被陈旧离线开关阻断。
- 当前员工页也已对 OfflineDemoApiError 静默 fallback，不再把 skip 文案展示给用户。
- 若仍复现，多半是浏览器 tab 仍加载旧 bundle 或预览服务未重启到最新构建。

## 已验证
- 5003 后端员工 API 可读。
- 4173 代理员工 API 可读。
- 相关单测与构建通过。

## 2026-06-20 真实浏览器补证
- 场景：`aimes_offline_demo=true` 陈旧离线开关 + 真实后端 JWT。
- 登录：`POST http://127.0.0.1:4173/api/v1/auth/login` 返回 200，token 前缀 `eyJhbGciOiJI`。
- 员工请求：`GET http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20` 返回 200。
- DOM：`http://127.0.0.1:4173/scheduling/employee`，`.emp-board=true`，`.emp-card` 数量 3。
- 页面正文：未包含 `Offline demo mode skipped backend request`。
- 控制台/请求失败/pageerror：未记录相关失败。
