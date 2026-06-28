# 20260614 Admin startup config fallback fail loud

## Change
- Aggregated `AdminBoard` startup failures across governance evidence, system configs, and notification configs.
- System config and notification config backend failures now remain visible when local demo fallback data is shown.
- Prioritized config fallback failures in the alert summary so they are not hidden behind lower-priority offline governance source failures.

## Evidence
- `npm run test:unit -- tests/unit/admin-board.test.ts -t "aggregates startup config fallback failures"`: 1 passed.
- `npm run test:unit -- tests/unit/admin-board.test.ts`: 16 passed.
- `npm run test:e2e -- tests/e2e/admin.spec.ts -g "启动系统配置与通知配置读取失败" --project=chromium`: 1 passed.
- `npm run test:e2e -- tests/e2e/admin.spec.ts --project=chromium`: 33 passed.
- `npm run test:unit:coverage`: 105 files / 779 tests passed; global line coverage 84.24%; `AdminBoard.vue` line coverage 80.10%.

## Fail Loud
- Known coverage warning remains: `--localstorage-file was provided without a valid path`.
