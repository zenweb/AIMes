# 2026-06-20 Issue - 员工页旧 Demo 会话导致后端请求被跳过

## 现象
- 用户看到：`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`。

## 根因
- 后端员工 API 正常。
- 问题发生在前端运行态：旧 `demo-token-*` 与 `aimes_offline_demo=true` 直接进入受保护页面时，现有清理逻辑只覆盖 `/login`，没有覆盖 `/employee` 这类直接入口。

## 修复
- `src/frontend/src/router/index.ts`
- `src/frontend/middleware/auth.global.ts`
- `src/frontend/tests/unit/router-auth.test.ts`
- `src/frontend/tests/unit/nuxt-auth-middleware.test.ts`

## 状态
- 已修复并验证。
