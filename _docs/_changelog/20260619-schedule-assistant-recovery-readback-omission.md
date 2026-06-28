# 2026-06-19 Schedule Assistant Recovery Readback Omission

## Summary
- Fixed a ScheduleBoard readback consistency gap after closing an Assistant recovery handoff.
- When backend refresh succeeds but omits the just-closed recovery package, the UI now keeps the local closed package visible.
- Added a fail-loud sync note: `Assistant 恢复交接闭环刷新缺少刚闭环的执行包，已保留本地闭环建议：<id>`.
- This preserves the closed package trace in the handoff panel instead of making a successful local closure disappear after refresh.

## Evidence
- RED: `npm run test:unit -- schedule-board.test.ts -t "keeps the closed assistant recovery package visible when backend refresh omits it"` failed because `.sync-note` was missing.
- RED deeper root cause: after the first fix, the same test still failed because `loadRiskTriggeredEvents()` later overwrote the kept local package.
- GREEN targeted: `npm run test:unit -- schedule-board.test.ts -t "keeps the closed assistant recovery package visible when backend refresh omits it"` passed.
- ScheduleBoard suite: `npm run test:unit -- schedule-board.test.ts` passed, 67 tests.
- Full coverage: `npm run test:unit:coverage` passed, 111 files / 1090 tests. Total coverage: statements 89.73%, branches 77.18%, functions 89.90%, lines 92.84%.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `http://127.0.0.1:4173/scheduling/scheduling` rendered the scheduling workbench, bilingual guidance, contextual links, help anchor, and fail-loud status surfaces. Screenshot captured as `schedule-assistant-recovery-readback-omission-real-browser-20260619`.

## Files
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/tests/unit/schedule-board.test.ts`
