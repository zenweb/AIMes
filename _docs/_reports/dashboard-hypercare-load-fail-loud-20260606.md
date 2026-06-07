# Dashboard Hypercare 验收读取失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续推进 Dashboard 生产运营控制塔，不扩展新功能。
- 本片只处理 `DashboardBoard` 初始化读取 POC Hypercare 上线验收记录失败时未 fail-loud 的问题。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/dashboard/DashboardBoard.vue`
  - 新增 `pocHypercareAcceptanceError` 状态。
  - `applyPocHypercareAcceptance()` 捕获 `readPocHypercareAcceptanceRecordBackendFirst()` 失败。
  - 读取失败时保留首页主体渲染，并显示 `上线验收记录读取失败`、`POC Hypercare 验收状态暂未加载` 和具体错误原因。
  - 读取成功时清空错误状态。
- `src/frontend/tests/unit/dashboard-board.test.ts`
  - 新增初始化失败路径单元测试，模拟 Hypercare 验收记录后端读取失败。
  - 断言页面仍展示 `生产运营控制塔`，并可见失败标题、影响面和错误原因。

## 验证

- `npm.cmd run test:unit -- tests/unit/dashboard-board.test.ts`
  - 1 file passed。
  - 3 tests passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 539 tests passed。
  - 全局覆盖率：statements 75.01%，branches 58.95%，functions 69.9%，lines 78.42%。
  - `DashboardBoard.vue`：statements 72.67%，branches 72.6%，functions 46.51%，lines 76.47%。
- `npm.cmd run test:e2e -- tests/e2e/dashboard.spec.ts`
  - Nuxt production build passed。
  - Chromium 9/9 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
