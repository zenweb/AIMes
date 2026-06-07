# 2026-06-05 首登改密闭环审查

## Review Result

- 代码侧结论：首登必须改密的前端闭环已经形成，登录页、改密页、Vue Router 守卫和 Nuxt 全局中间件逻辑已经对齐。
- 证据侧结论：相关单测和真实 Chrome e2e 均已通过，分流、校验、回跳和登录态清理都有可执行证据。
- 原审查保留项已关闭：浏览器级 e2e 失败根因是 Nuxt 真实入口未补 `/change-password` 页面，且测试用 `page.evaluate()` 写状态后新导航被全局 init script 清掉；两处均已修正。

## What Was Verified

- 登录成功后能按 `mustChangePassword` 分流。
- 改密页会做空值校验、两次密码一致性校验和成功后的登出回跳。
- 路由守卫会拦截必须改密的用户进入业务页。
- Nuxt demo shell 下，首登账号访问 `/login` 会被送到 `/change-password`。
- Nuxt demo shell 下，改密成功后会返回 `/login?passwordChanged=1` 并显示成功提示。
- `npm run lint` 通过；注意该脚本当前只覆盖 `src`、`tests/unit`、`vitest.config.ts`，不覆盖 Nuxt 根层、middleware、pages、e2e。
- `npm run test:e2e -- login.spec.ts` 通过：`11 tests passed`。
- `npm run test:unit -- tests/unit/change-password-page.test.ts tests/unit/login-page.test.ts tests/unit/router-auth.test.ts` 通过：`3 files / 18 tests passed`。

## What Remains

- 前端首登改密链路暂无未收口项。
- 发布闸门仍需按独立发布轨道追踪，不能由这条前端 e2e 替代。

## Baseline Gaps

- `node ./node_modules/vue-tsc/bin/vue-tsc.js --noEmit` 仍为红，失败点集中在既有 `GanttChart.vue`、`MainLayout.vue`、`PurchaseBoard.vue`、`ScheduleBoard.vue`；本次首登改密文件未出现在错误列表中。
- 对 Nuxt 根层文件的单独 ESLint 检查会提示 `File ignored because no matching configuration was supplied`，说明 lint 配置本身还未覆盖 `app.vue`、`middleware/*`、`pages/*` 和 `tests/e2e/*`。
