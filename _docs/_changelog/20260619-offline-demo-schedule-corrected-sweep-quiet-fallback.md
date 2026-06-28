# 2026-06-19 Offline Demo Schedule Corrected Sweep Quiet Fallback

## Change
- ScheduleBoard now treats `OfflineDemoApiError` from startup latest adoption feedback restore as an intentional offline-demo skip.
- ScheduleBoard now preserves demo schedule fallback without rendering backend-skip text when `/api/v1/scheduling/current` is intentionally skipped by offline demo mode.
- Ordinary backend failures remain fail-loud for latest feedback restore and current schedule loading.

## Corrected Sweep
- The previous broad sweep used an invalid cached role value (`Administrator`) and caused role-protected pages to redirect to `/scheduling/dashboard`.
- The corrected sweep uses the real demo role value (`Admin`) and treats any unexpected final path as a failure.
- Corrected real-browser sweep covered 19 routes:
  - `/dashboard`, `/risk`, `/scheduling`, `/quality`, `/equipment`, `/production`, `/bom`, `/routing`, `/anomaly`
  - `/knowledge/documents`, `/inventory`, `/purchase`, `/employee`, `/admin`, `/barcode`, `/scanner`, `/audit-logs`, `/report`, `/monitoring`

## Evidence
- Corrected sweep before the fix found only `/scheduling/scheduling?offlineDemo=1` leaking:
  - `后端最新采纳反馈读取失败...Offline demo mode skipped backend request: /api/v1/scheduling/adoption-feedback/latest`
  - `后端排产服务不可用...Offline demo mode skipped backend request: /api/v1/scheduling/current`
- RED verified:
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "quietly keeps loading the schedule plan"` failed because `.sync-note` still rendered.
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "quietly shows the demo schedule"` failed because the warning still rendered `后端排产服务不可用`.
- GREEN verified:
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "quietly keeps loading the schedule plan"`: 1 passed.
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "quietly shows the demo schedule"`: 1 passed.
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "latest feedback restore fails"`: 1 passed.
  - `npm run test:unit -- tests/unit/schedule-board.test.ts -t "backend load failure reason"`: 1 passed.
  - `npm run test:unit -- tests/unit/schedule-board.test.ts`: 69 passed.
  - Offline demo regression package: 25 files passed, 581 tests passed.
  - `npm run build`: passed.
  - Corrected real-browser sweep after rebuild: `SWEEP_FAILURES=[]`.

