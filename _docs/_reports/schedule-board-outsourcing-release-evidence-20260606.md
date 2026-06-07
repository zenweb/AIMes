# ScheduleBoard 外协排产释放真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片聚焦 AI 排产工作台的外协到货释放闭环：外协已到货后，调度员采纳 Agent 建议必须真实归档排产释放 trace、审计号和 OTD 证据链。
- 本片不扩功能，只补 `ScheduleBoard` 模块内真实 Chromium 证据，并承接上一片单元覆盖。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 新增 `外协到货建议被采纳后真实浏览器归档排产释放证据`。
  - 在真实浏览器 localStorage 中写入“外协已到货、尚未排产释放”的 `product-flange` 证据包。
  - 拦截 `/api/v1/scheduling/outsourcing-commitments*`，确保用例验证本地离线演示证据链，不依赖不可控后端。
  - 刷新排产页后点击 `复核排产影响`、`采纳此建议`。
  - 断言 UI 展示 `外协排产释放已确认`、`TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521`、`AUD-OUTSOURCING-SCHEDULE-RELEASE-FLANGE-20260521-001`、`OTD +2% 已释放归档`、`延期 0 单外部等待`。
  - 断言释放后的事件卡变为 `已释放`，并断言 localStorage 中外协包和 OTD 证据链都写入释放 trace。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "外协到货建议"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/schedule-board.test.ts`
  - 21/21 passed。
- `npm.cmd run test:unit:coverage`
  - 84/84 files，555/555 tests passed。
  - `ScheduleBoard.vue` line coverage：74.25%。

## 未通过/未覆盖项

- `npx.cmd eslint tests/e2e/scheduling.spec.ts --max-warnings 0` 未能作为有效 lint 证据：当前 `eslint.config.cjs` 只覆盖 `src/**/*.{ts,vue}`、`tests/unit/**/*.ts`、`vitest.config.ts`，因此 `tests/e2e/scheduling.spec.ts` 被 ESLint 报告为未纳入配置。
- 本片未重跑完整 `tests/e2e/scheduling.spec.ts`，因为本次改动是单条真实 Chromium 用例，已通过定向生产构建 + Chromium 验证。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
