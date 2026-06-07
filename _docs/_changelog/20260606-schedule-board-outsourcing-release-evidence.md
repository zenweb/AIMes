# 2026-06-06 ScheduleBoard 外协排产释放证据

## Changed

- 为 `ScheduleBoard` 新增真实 Chromium 用例，覆盖“外协已到货 -> 调度员复核排产影响 -> 采纳 Agent 建议 -> 排产释放归档”。
- 断言释放后的 UI、外协承诺包 localStorage、OTD 证据链 localStorage 都写入 `TRACE-OUTSOURCING-FLANGE-SCHEDULE-RELEASE-20260521`。
- 承接上一片单元证据：外协释放正向归档已由 unit 覆盖，本片补齐模块内真实浏览器证据。

## Tests

- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "外协到货建议"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/schedule-board.test.ts`：21/21 passed。
- `npm.cmd run test:unit:coverage`：84/84 files，555/555 tests passed，`ScheduleBoard.vue` line coverage 74.25%。

## Notes

- `tests/e2e` 当前未纳入 ESLint 配置；`npx.cmd eslint tests/e2e/scheduling.spec.ts --max-warnings 0` 返回 ignored warning，不能作为 lint 通过证据。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
