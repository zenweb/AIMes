# 2026-07-05 Schedule Export CSV Download E2E Changelog

## Added

- Added a real-browser Playwright regression for Scheduling toolbar CSV export.
- Added `_docs/_review/20260705-schedule-export-csv-download-e2e.md`.

## Verified

- `npm run lint -- tests/e2e/scheduling.spec.ts`: passed.
- `git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts`: passed.
- `npm run test:e2e -- --grep "工具栏导出 CSV 时真实浏览器下载当前排产计划"`: `1 passed`.
- GitHub Actions on `924bd5a693d7de86b8623dfc4b2bbb19bb76dc47`:
  - CI `28725364165`: success.
  - Agent Evaluation `28725364169`: success.

## Result

- Scheduling CSV export browser-download evidence: `PASS`.
- No production code changed.
- Strict v1.0.0 remains deferred until real gray observation evidence proves `P0=0` and `P1=0`.
