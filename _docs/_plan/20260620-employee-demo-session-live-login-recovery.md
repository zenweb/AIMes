# 2026-06-20 Plan - 员工页 demo 会话切回真实登录

## 成功标准
- 普通 `/scheduling/login` 入口不能被旧 demo token 卡住。
- `admin/admin123` 必须走真实后端认证。
- 员工页必须请求真实 `/api/v1/employee` 并返回 200。
- 页面不能展示 offline demo skip 或本地示例数据提示。

## 执行
1. 直连后端登录和员工 API，确认服务与账号可用。
2. 用真实浏览器复现旧 demo token 被 login 跳到 dashboard 的问题。
3. 先加失败测试锁定 Vue Router 与 Nuxt middleware 的恢复路径。
4. 用窄逻辑清理普通登录入口的 stale demo session。
5. 运行单测、构建、真实浏览器证据。

## 状态
- 已完成并验证。
