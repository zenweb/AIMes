# 员工列表真实登录态离线开关复核

## 变更
- 复核员工列表 `/api/v1/employee` 在真实 JWT 与陈旧 `aimes_offline_demo=true` 共存时的行为。
- 确认当前源码中 `EmployeeBoard` 对 `OfflineDemoApiError` 静默降级，不再把 `Offline demo mode skipped backend request` 暴露为用户红条。
- 重新构建前端并恢复 4173 预览入口。

## 验证
- `npm run test:unit -- tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/http-refresh.test.ts`：3 files / 45 tests passed。
- `npm run build`：通过。
- `http://127.0.0.1:5003/api/v1/employee` 携带真实 token 返回 3 名员工。
- `http://127.0.0.1:4173/api/v1/employee` 携带真实 token 经前端代理返回 3 名员工。
- `http://127.0.0.1:4173/scheduling/login` 当前返回 200。

## 备注
- Puppeteer/Playwright 页面级探针在本轮出现卡顿/超时，未作为最终完成证据；本轮以 API、代理、单测、构建和入口 HTTP 探测封存。

## 2026-06-20 真实浏览器补证
- 场景：`aimes_offline_demo=true` 陈旧离线开关 + 真实后端 JWT。
- 登录：`POST http://127.0.0.1:4173/api/v1/auth/login` 返回 200，token 前缀 `eyJhbGciOiJI`。
- 员工请求：`GET http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20` 返回 200。
- DOM：`http://127.0.0.1:4173/scheduling/employee`，`.emp-board=true`，`.emp-card` 数量 3。
- 页面正文：未包含 `Offline demo mode skipped backend request`。
- 控制台/请求失败/pageerror：未记录相关失败。
