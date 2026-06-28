# 2026-06-20 Todo - 员工页真实登录态离线标记启动自愈后续

## 下一步
- 继续用真实浏览器扫 `/scheduling/admin` 与 `/scheduling/audit-logs` 的 POC optional 404 用户可见提示，避免可选空状态被误报成失败。
- 保持后端端口 `5003`，不要回退到 `5000`。
- 如用户本机仍看到旧提示，优先让页面硬刷新或重新打开 `http://127.0.0.1:4173/scheduling/login` 后登录，以确认浏览器不是旧 bundle。

