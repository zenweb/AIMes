# 2026-06-19 Changelog: Quality rework evidence fail-loud

## Changed
- Added a fail-loud guard around `QualityBoard` rework impact evidence archival.
- When rework impact storage fails, the UI now keeps the existing rework preview, avoids showing a success sync message, and surfaces the backend/storage reason in the alert banner.

## Evidence
- RED: `npm run test:unit -- tests/unit/quality-board.test.ts -t "fails loud when quality rework impact evidence cannot be archived"` failed because the storage error escaped the component handler.
- GREEN: targeted test passed.
- Component suite: `npm run test:unit -- tests/unit/quality-board.test.ts` passed, 31 tests.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1104 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.

## Release Gate Note
- Strict v1.0.0 is still not complete until first gray observation and the two-week no P0/P1 window are resolved.
