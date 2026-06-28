# 2026-06-15 Quality Rework Backend-First Auditable Fallback

## Changed

- Hardened `readQualityReworkImpactBackendFirst` so incomplete backend records cannot override local audited quality rework evidence.
- Added a regression test proving partial backend latest records fall back to the local complete rework impact.

## Why

Quality rework impact is consumed by schedule, report, admin, and chat paths. A partial backend payload could previously be treated as authoritative if it had a newer `createdAt`.

## Validation

- `npm run test:unit -- tests/unit/quality-rework-sync.test.ts --reporter=dot`
- `npm run test:unit -- tests/unit/quality-board.test.ts tests/unit/quality-rework-impact-panel.test.ts tests/unit/report-board.test.ts tests/unit/schedule-board.test.ts --reporter=dot`
- `npm run test:unit -- --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`

## Result

- Targeted quality rework sync tests: 6 passed.
- Related quality/report/schedule tests: 116 passed.
- Full frontend unit suite: 111 files / 994 tests passed.
- Full frontend coverage: statements 87.72%, branches 74.16%, functions 87.19%, lines 90.94%.
- `src/utils/quality-rework-sync.ts`: statements 77.55%, branches 53.65%, functions 81.81%, lines 84.61%.

## Boundary

This is a hardening change for an existing quality evidence path. It does not add user-facing feature scope.
