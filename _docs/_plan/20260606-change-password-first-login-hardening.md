# Plan: 首登强制改密精品化

## 成功标准

- 首登强制改密失败恢复分支有单测证明。
- 后端拒绝改密时页面 fail-loud，不登出、不跳转，并能把焦点还给用户。
- 真实 Chromium 登录/改密主链路仍通过。
- 覆盖率增量可被 `test:unit:coverage` 证明。

## 执行记录

- [x] 跑前端 unit coverage，确认 `ChangePasswordPage.vue` 行覆盖率 65.71%。
- [x] 补失败恢复单测。
- [x] 修复后端拒绝改密时回焦顺序。
- [x] 验证 `npm.cmd run test:unit -- tests/unit/change-password-page.test.ts`。
- [x] 验证 `npx.cmd eslint src/components/auth/ChangePasswordPage.vue tests/unit/change-password-page.test.ts --max-warnings 0`。
- [x] 验证 `npm.cmd run test:e2e -- tests/e2e/login.spec.ts`。
- [x] 验证 `npm.cmd run test:unit:coverage`。
