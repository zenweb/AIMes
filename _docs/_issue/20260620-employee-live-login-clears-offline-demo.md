# 2026-06-20 Issue - Employee Live Login Clears Offline Demo

## Symptom
- 员工列表展示本地示例数据，并提示：`Offline demo mode skipped backend request: /api/v1/employee`。

## Root Cause
- 浏览器历史状态中保留 `localStorage.aimes_offline_demo=true`。
- 认证 store 使用离线 demo 状态决定是否优先 demo 登录，导致普通 `admin/admin123` 登录可能绕过后端。
- 后续员工接口请求被 HTTP 拦截器认为处于 offline demo 模式，因此跳过 `/api/v1/employee`。

## Fix
- 普通登录入口只在当前 URL 显式声明 demo 或构建配置声明 demo 时优先 demo。
- 非 demo 登录在调用后端登录前清理旧 demo 状态，后端登录成功后将 demo 标记保持为 `false`。

## Verification
- 单测：45 passed。
- 浏览器：员工页未再出现 skip 后端请求或加载失败提示。
