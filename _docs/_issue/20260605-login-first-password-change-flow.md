# 2026-06-05 首登改密浏览器证据收口

## Issue

- 问题：当前 demo 壳层下，浏览器级登录链路一度不能稳定证明 `login -> change-password -> login` 的完整回跳。
- 影响：修复前不能把“首登改密闭环”写成已被浏览器实证完全收口。

## Evidence

- 单测已经通过，说明代码逻辑本身是成立的。
- 首轮真实 Chrome e2e 失败：
  - `page.evaluate()` 写入首登态后再次 `page.goto()`，全局 `beforeEach` 的 init script 会在新页面加载前清掉 localStorage。
  - Nuxt 真实入口走 `middleware/auth.global.ts` + `pages/*`，不是 `src/router/index.ts`；当时没有 `pages/change-password.vue`，中间件也没有处理 `mustChangePassword`。
- 修复后验证：
  - `npm run test:e2e -- login.spec.ts`：`11 tests passed`
  - `npm run test:unit -- tests/unit/change-password-page.test.ts tests/unit/login-page.test.ts tests/unit/router-auth.test.ts`：`3 files / 18 tests passed`

## Status

- 已关闭。
- 保留记录用于防止后续把 Nuxt 真实入口和 Vue Router 单测入口混为一谈。
