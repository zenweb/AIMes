# 2026-06-13 Changelog: Schedule live staging rejection evidence

## Changed

- Added live staging real-browser evidence for the scheduling drag-save rejection path.
- `scheduling-live-staging.spec.ts` now verifies a real dhtmlx drag against a real API/PostgreSQL-backed non-editable plan.
- `src/frontend/scripts/e2e.mjs` now treats `scheduling-live-staging.spec` as a real dhtmlx target even when `-g` does not contain `live staging`.

## Evidence

- Unit: `npm run test:unit -- tests/unit/schedule-board.test.ts` => 26 passed.
- Mock real dhtmlx rejection: `npm run test:e2e -- scheduling.spec.ts -g "真实 dhtmlx 拖拽保存失败" --reporter=line --retries=0` => 1 passed.
- Live staging success + rejection: `AIMES_RUN_LIVE_STAGING_E2E=true AIMES_LIVE_API_BASE_URL=http://localhost:5000 npm run test:e2e -- scheduling-live-staging.spec.ts -g "拖拽保存后刷新|被非可编辑计划拒绝" --reporter=line --retries=0` => 2 passed.
- Screenshot and manifest:
  - `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-locked-plan-rejected.png`
  - `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-locked-plan-rejected-manifest.md`

