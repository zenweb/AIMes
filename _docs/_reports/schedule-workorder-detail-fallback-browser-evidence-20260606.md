# ScheduleBoard 工单详情失败兜底真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进 AI 排产工作台的任务级排产解释链路。
- 本片不改业务逻辑，只补真实 Chromium 证据：工单详情接口失败时，右侧详情面板必须明确展示失败原因和本地排产解释兜底。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增 `工单详情接口失败时真实浏览器展示本地排产解释兜底`。
  - 通过 Chromium 路由拦截 `**/api/v1/scheduling/workorders/**` 为 503。
  - 使用轻量甘特任务条的键盘 Enter 交互触发真实 `task-click`。
  - 断言详情面板显示 `工单详情加载失败`、`已显示本地排产解释兜底` 和后端错误原因。
  - 记录并断言路由命中数，避免测试只验证本地快捷入口。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "工单详情接口失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts`
  - Nuxt production build passed。
  - Chromium 27/27 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
