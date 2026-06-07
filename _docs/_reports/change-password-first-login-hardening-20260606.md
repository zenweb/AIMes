# 2026-06-06 首登强制改密精品化报告

## 目标

按覆盖率增量和用户必经程度选择下一片：`ChangePasswordPage.vue` 属于安全底线里的首登强制改密路径，初始行覆盖率只有 65.71%，且失败恢复分支覆盖不足。

## 变更

- 在 `src/frontend/tests/unit/change-password-page.test.ts` 增加 5 个意图型单测：
  - 登录信息失效时不调用后端并返回登录页。
  - 必填字段缺失时阻断安全敏感后端调用并聚焦首个缺失字段。
  - 部分字段缺失时聚焦第一个仍需修正的字段。
  - 字段编辑后清除错误和 `aria-invalid` 状态。
  - 后端拒绝改密时保留用户在强制改密页并恢复焦点。
- 修复 `src/frontend/src/components/auth/ChangePasswordPage.vue`：
  - 后端拒绝改密时先解除 `loading`，再执行 `nextTick()` 和当前密码框回焦。
  - 避免 disabled 输入框无法接收焦点导致用户恢复路径断掉。

## 验证

- PASS：`npm.cmd run test:unit -- tests/unit/change-password-page.test.ts`
  - 7/7 passed.
- PASS：`npx.cmd eslint src/components/auth/ChangePasswordPage.vue tests/unit/change-password-page.test.ts --max-warnings 0`
- PASS：`npm.cmd run test:e2e -- tests/e2e/login.spec.ts`
  - Production Nuxt build completed.
  - Chromium: 11/11 passed.
- PASS：`npm.cmd run test:unit:coverage`
  - Test files: 84/84 passed.
  - Tests: 554/554 passed.
  - `ChangePasswordPage.vue` line coverage: 65.71% -> 98.59%.
  - Overall line coverage: 78.44% -> 78.69%.

## 结论

首登强制改密路径的核心失败恢复分支已补齐测试，并修复一个真实焦点恢复缺陷。该切片属于现有安全关键功能精品化，不新增功能范围。
