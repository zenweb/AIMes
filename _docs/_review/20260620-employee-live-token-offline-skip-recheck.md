# Review: 员工列表真实登录态离线开关复核

## 结论
- 当前核心问题不是后端不可用：5003 后端与 4173 代理均能用真实 token 读取 `/api/v1/employee`。
- 当前源码不会再把 offline demo skip 错误显示为“员工列表加载失败”红条。
- 如果用户浏览器仍看到旧文案，优先刷新 4173 最新构建、清理页面缓存或确认当前 tab 是否仍加载旧 bundle。

## 风险
- 页面级真实浏览器自动化在本轮卡顿，尚未拿到 DOM 级最终截图证据。
- 工作区已有大量既有改动，本轮未做全量回归，也未整理无关 dirty 文件。

## 建议
- 后续继续拿真实浏览器证据时，先固定一个稳定 Playwright 脚本，限制等待条件，避免无限等待页面渲染。

## 2026-06-20 真实浏览器补证
- 场景：`aimes_offline_demo=true` 陈旧离线开关 + 真实后端 JWT。
- 登录：`POST http://127.0.0.1:4173/api/v1/auth/login` 返回 200，token 前缀 `eyJhbGciOiJI`。
- 员工请求：`GET http://127.0.0.1:4173/api/v1/employee?page=1&pageSize=20` 返回 200。
- DOM：`http://127.0.0.1:4173/scheduling/employee`，`.emp-board=true`，`.emp-card` 数量 3。
- 页面正文：未包含 `Offline demo mode skipped backend request`。
- 控制台/请求失败/pageerror：未记录相关失败。
