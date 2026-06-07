# Issue: 首登强制改密后端拒绝时回焦失败

## 现象

单测覆盖后发现：`ChangePasswordPage` 在后端拒绝改密时会设置错误和 invalid 状态，但焦点没有回到当前密码输入框。

## 根因

失败分支中 `loading` 仍为 `true`，输入框处于 disabled 状态；组件在 disabled 状态下调用 `focus()`，浏览器/jsdom 都不会把焦点交给该输入框。

## 修复

在 catch 分支中先将 `loading.value = false`，再 `await nextTick()` 并聚焦当前密码输入框。

## 验证

- PASS：`npm.cmd run test:unit -- tests/unit/change-password-page.test.ts`
- PASS：`npm.cmd run test:e2e -- tests/e2e/login.spec.ts`
- PASS：`npm.cmd run test:unit:coverage`

## 状态

已关闭。
