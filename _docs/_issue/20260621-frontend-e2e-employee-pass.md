# 2026-06-21 Issue - Employee E2E Auth Mode Interference

## 问题

员工 e2e 中 demo session 与 live/mock session 混用：

- describe 级 `addInitScript` 每次导航重放 demo token。
- live/mock 员工用例只设置部分认证状态，路由守卫会清会话并跳转 login。
- 未 mock 的证据写入 API 返回 401 时，HTTP 层会清认证，造成 login/dashboard 循环。

## 处理

- 增加 live/mock session 完整种子：token、refresh token、user、role。
- 增加 `aimes_e2e_live_mock` 测试开关，防止 demo init script 覆盖 live/mock 用例。
- 补齐 refresh、employee、labor evidence、OTD evidence 与 API 兜底路由。

## 状态

已关闭。员工 e2e 单片 12/12 PASS。
