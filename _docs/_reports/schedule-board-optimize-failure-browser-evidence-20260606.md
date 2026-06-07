# ScheduleBoard 排产优化失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：调度员在 `ScheduleBoard` 点击 `排产优化` 后，后端优化接口失败。
- 目标：真实 Chromium 中优化失败必须 fail loud，并保留当前甘特图，不让用户误以为优化成功或丢失当前排产上下文。

## 变更

- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增真实 Chromium 用例：`排产优化失败时真实浏览器保留当前甘特图并展示 fail-loud 告警`。
  - 拦截 `/api/v1/scheduling/optimize` 返回 503。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产优化失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 点击真实页面 `排产优化` 按钮。
- 优化接口返回 `chromium optimizer unavailable`。
- 页面展示 `.error-banner[role="alert"]`。
- 告警包含：
  - `优化失败`
  - `chromium optimizer unavailable`
- 当前 `.gantt_task_line` 数量保持不变。

## 结论

- `ScheduleBoard` 排产优化失败路径现在具备真实浏览器 fail-loud 证据。
- 本片未修改生产代码，只补齐既有行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
