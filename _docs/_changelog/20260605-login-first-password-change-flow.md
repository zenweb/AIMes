# 2026-06-05 首登改密闭环收口

## Change

- 前端首登改密闭环已经补齐到代码层：
  - `LoginPage.vue` 在登录成功后按 `mustChangePassword` 分流到 `/change-password`
  - 新增 `ChangePasswordPage.vue`
  - `router/index.ts` 增加 `/change-password` 路由和守卫
  - `api/auth.ts` 增加 `changePassword()`
- Nuxt 真实浏览器入口已补齐：
  - 新增 `pages/change-password.vue` 复用首登改密页
  - `middleware/auth.global.ts` 读取 `aimes_user.mustChangePassword`，阻止首登账号进入业务页或从登录页跳 dashboard
  - `app.vue` 支持改密页不套业务 shell
  - `login.spec.ts` 改为用 `page.addInitScript()` 注入首登态，避免全局清理脚本在新页面加载前删掉测试状态
- 新增并通过的单测：
  - `change-password-page.test.ts`
  - `login-page.test.ts`
  - `router-auth.test.ts`

## Validation

- `npm run test:unit -- tests/unit/change-password-page.test.ts tests/unit/login-page.test.ts tests/unit/router-auth.test.ts`：`3 files / 18 tests passed`
- `npm run test:e2e -- login.spec.ts`：`11 tests passed`，真实 Chrome 覆盖普通登录、首登登录分流、首登态守卫和 `/change-password -> /login?passwordChanged=1`

## Current Boundary

- 首登改密前端浏览器证据已收口。
- 仍未替代发布级后端/灰度/安全签字闸门；这些继续按发布轨道单独追。
