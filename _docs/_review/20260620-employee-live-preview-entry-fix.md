# 2026-06-20 Review - Employee Live Preview Entry Fix

## Findings
- 根因 1：普通登录仍会被构建级 `VITE_OFFLINE_DEMO=true` 劫持为 demo 登录，导致后续 `/api/v1/employee` 被 HTTP 拦截器跳过。
- 根因 2：4173 production preview 缺少生产态 `/api` 代理，浏览器登录请求会拿到 Nuxt HTML/redirect，而不是 5003 后端 JSON。

## Decision
- 离线 demo 必须是显式入口能力：只接受当前 URL 的 `offlineDemo=1|true|offline`。
- 4173 作为用户可访问入口时必须代理 API 到 5003，避免用户看到“用户名或密码错误”但实际是前端 HTML fallback。

## Residual Risk
- 当前验证使用本机 5003 后端和 seeded `admin/admin123`。如果后端进程未启动或数据库未 seed，登录仍会失败，但不会再被误判为 offline demo skip。
