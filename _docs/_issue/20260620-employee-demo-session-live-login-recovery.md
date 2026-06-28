# 2026-06-20 Issue - 员工列表加载失败展示本地示例数据

## 现象
- 用户在员工页看到：`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。

## 根因
- 旧离线演示会话保留了 `demo-token-*` 与 `aimes_offline_demo=true`。
- 普通 `/scheduling/login` 在 Vue Router 与 Nuxt middleware 中都把该 demo token 视为已认证，直接跳转到 `/dashboard`，用户无法重新执行真实后端登录。
- 后续员工页请求在 HTTP request interceptor 中被 offline demo 逻辑跳过，触发本地员工兜底。

## 修复
- 普通登录入口检测到 stale demo token 且没有显式 demo query 时，清理 cached auth 并退出 offline demo。
- 保留显式 demo 入口行为。

## 证据
- 后端直连 `/api/v1/auth/login` 与 `/api/v1/employee` 正常。
- 真实浏览器修复后员工 API 返回 200，无本地示例数据提示。
