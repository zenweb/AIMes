# 2026-06-06 ScheduleBoard 空排产计划 fail-loud

## 变更

- `ScheduleBoard.vue` 增加后端排产计划空任务校验：`items: []` 不再被视为有效计划。
- 空计划触发既有 fallback：展示“后端排产服务不可用，当前显示演示排产数据：后端排产计划缺少可执行任务...”预警，并恢复 demo 甘特任务。
- `schedule-board.test.ts` 增加单元回归覆盖。
- `scheduling.spec.ts` 增加真实 Chromium e2e 覆盖空计划 fail-loud fallback。

## 验证

- `npm run test:unit -- tests/unit/schedule-board.test.ts`：19 passed。
- `npm run test:unit:coverage`：84 files / 516 tests passed。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts`：生产构建后 Chromium 25 passed。

## 备注

- Codex 内置 Browser 插件仍受用户目录 ESM 配置影响无法启动；本轮真实浏览器证据来自 Playwright Chromium。
- B 轨发布门禁未因此关闭。
