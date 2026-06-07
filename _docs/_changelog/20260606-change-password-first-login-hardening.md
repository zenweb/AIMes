# 2026-06-06 首登强制改密精品化

- 按覆盖率杠杆选择 `ChangePasswordPage.vue` 作为下一片安全关键路径。
- 为首登强制改密增加登录态失效、缺字段、密码不一致、错误清除、后端拒绝等单测覆盖。
- 修复后端拒绝改密时 disabled 输入框无法回焦的问题。
- 验证 `ChangePasswordPage.vue` 行覆盖率从 65.71% 提升到 98.59%。
- 验证 `login.spec.ts` 真实 Chromium 11/11 passed。
