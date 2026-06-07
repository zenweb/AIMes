# Dashboard 生产概览数据读取失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进 Dashboard 生产运营控制塔，不扩展新功能。
- 本片只处理 `DashboardBoard` 初始化读取生产概览数据失败时没有页面级 fail-loud UI 的问题。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/dashboard/DashboardBoard.vue`
  - 新增 `dashboardDataError` 状态。
  - `getDashboard()` 失败时显示 `生产概览数据读取失败`。
  - 错误文案明确影响面：`KPI、设备状态、今日排产与物料预警暂未加载`。
  - 失败原因通过 `errorMessage()` 展示给用户。
  - 后端读取失败后仍保留控制塔、指挥中心和 Demo runbook 渲染。
- `src/frontend/tests/unit/dashboard-board.test.ts`
  - 新增初始化失败路径单元测试，模拟 `getDashboard()` 抛错。
- `src/frontend/tests/e2e/dashboard.spec.ts`
  - 新增 Chromium 失败态用例，关闭 offline demo 后拦截 `/api/v1/dashboard` 为 503。
  - 断言真实浏览器中 fail-loud 区域展示失败标题、影响面和后端错误原因。

## 验证

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`
  - 1 file passed。
  - 4 tests passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 540 tests passed。
  - 全局覆盖率：statements 75.01%，branches 58.97%，functions 69.9%，lines 78.41%。
  - `DashboardBoard.vue`：statements 72.31%，branches 73.68%，functions 46.51%，lines 75.94%。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`
  - Nuxt production build passed。
  - Chromium 10/10 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
