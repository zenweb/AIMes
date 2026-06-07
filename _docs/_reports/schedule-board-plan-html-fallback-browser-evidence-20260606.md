# ScheduleBoard 排产计划 HTML fallback 真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨质量切片：`ScheduleBoard.vue` 初始化读取当前排产计划时，后端返回 HTML fallback。
- 目标：排产页不能只暴露底层 `/scheduling/current` HTML fallback；必须保留“排产计划载荷不完整”的业务上下文，并回退到可执行 demo 排产。

## RED

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产计划返回 HTML fallback"`
- 结果：Chromium 失败。
- 失败证据：页面 warning 只显示 `API 返回了 HTML fallback，疑似后端不可用：/scheduling/current`，没有显示 `后端排产计划载荷不完整`。

## 变更

- `src/frontend/src/components/schedule/ScheduleBoard.vue`
  - 在 `loadData()` 的 `api.getCurrentPlan()` 边界补业务上下文。
  - 排产计划请求失败时抛出 `后端排产计划载荷不完整，已切换演示排产数据：<底层原因>`。
- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增真实 Chromium 用例：`排产计划返回 HTML fallback 时真实浏览器展示 fail-loud fallback`。
  - 拦截 `/api/v1/scheduling/current` 返回 `text/html`，断言 warning 和 demo 甘特任务可见。

## GREEN

- `npm.cmd run test:unit -- tests/unit/schedule-board.test.ts -t "schedule plan payload"`
  - 结果：1 passed，20 skipped。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "排产计划返回 HTML fallback"`
  - 结果：Nuxt production build passed，Chromium 1/1 passed。

## 覆盖

- 真实 Chromium 中当前排产计划接口返回 HTML fallback。
- 排产页展示：
  - `后端排产服务不可用`
  - `当前显示演示排产数据`
  - `后端排产计划载荷不完整`
- 页面仍渲染 `.gantt_task_line`，避免用户看到不可执行空甘特图。

## 结论

- `ScheduleBoard` 排产计划 HTML fallback 现在具备真实浏览器 fail-loud 证据。
- 本片修复的是既有排产功能的可诊断性和可靠性，不扩展新功能。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
