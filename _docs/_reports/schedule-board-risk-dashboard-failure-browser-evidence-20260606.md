# ScheduleBoard 风险看板读取失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：`ScheduleBoard` 在排产计划和设备列表成功加载后，风险看板接口读取失败。
- 目标：真实 Chromium 中风险事件必须 fail loud，并展示本地演示事件队列兜底。

## 变更

- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增真实 Chromium 用例：`风险看板读取失败时真实浏览器展示本地事件 fallback`。
  - 固定 `/api/v1/scheduling/current`、`/api/v1/equipment`、`/api/v1/equipment/bottlenecks` 的最小成功业务载荷，确保浏览器真实进入风险看板分支。
  - 拦截 `/api/v1/risk/dashboard` 返回 503，并用 `riskRequests` 断言该请求真实命中。

## Verification

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "风险看板读取失败"`
- 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 风险看板请求真实命中 Playwright route。
- 页面展示 `.risk-event-sync-note`。
- 状态提示包含：
  - `风险事件加载失败`
  - `已显示本地演示事件`
  - `chromium risk dashboard unavailable`
- 状态提示具备 `role="status"` 和 `aria-live="polite"`。
- 本地事件队列仍展示缺料、设备故障、急单插单三类事件。

## 结论

- `ScheduleBoard` 风险看板读取失败路径现在具备真实浏览器 fail-loud 证据。
- 本片未修改生产代码，只补齐既有行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
