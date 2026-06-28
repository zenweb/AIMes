# 20260614 Schedule latest feedback startup fail loud

## Change
- `ScheduleBoard` startup now continues loading the current schedule plan when latest adoption feedback restore fails.
- Latest feedback backend failures are no longer swallowed in the API wrapper; callers must handle and surface them.
- The schedule page now shows a visible fail-loud note while falling back to local recent feedback.
- Default Docker/staging evidence entry points were moved from `localhost:5000` to `localhost:5002` for the API host port.

## Evidence
- `npm run test:unit -- tests/unit/scheduling-api.test.ts`: 1 passed.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "continues loading the schedule plan when latest feedback restore fails"`: 1 passed / 40 skipped.
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: 41 passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "最新采纳反馈读取失败" --project=chromium`: 1 passed.
- `npm run test:unit:coverage`: 106 files / 781 tests passed; global line coverage 84.01%; `ScheduleBoard.vue` line coverage 78.48%.

## Fail Loud
- `localhost:5002` is currently occupied by `learun.webapi.exe` from `C:\AIWorks\MixMes\ZXZQL\V1\api\learun.webapi\bin\Debug\net7.0\learun.webapi.exe`; AIMes defaults are changed, but starting AIMes on host port 5002 still requires that port to be free.
