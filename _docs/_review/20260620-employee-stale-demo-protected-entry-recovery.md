# 2026-06-20 Review - 员工页旧 Demo 会话受保护入口恢复

## 结论
- 通过。

## 证据
- 后端直接 API：`GET http://127.0.0.1:5003/api/v1/employee?page=1&pageSize=20` 返回 200 与 3 条员工数据。
- 真实浏览器 stale demo 场景：旧 demo localStorage 直进 `/scheduling/employee`，新构建会清理缓存并回到 `/scheduling/login`。
- 真实浏览器 live 场景：登录后员工页无 `员工列表加载失败`，无 `Offline demo mode skipped backend request`。

## 风险
- 仅改变非显式 demo 入口。显式 `offlineDemo=1` / `demoMode=offline` 仍保留离线演示语义。
