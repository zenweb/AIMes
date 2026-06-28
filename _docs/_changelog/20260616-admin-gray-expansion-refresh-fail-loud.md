# 2026-06-16 Admin Gray Expansion Refresh Fail Loud

- Added unit regression coverage for `AdminBoard.vue` quality gray expansion approval refresh failure.
- Locked the governance intent that when expansion approval is written but the backend decision refresh fails:
  - `approveQualityKnowledgeGrayReleaseExpansion` is still called;
  - backend decision records are retried/refreshed;
  - the admin alert clearly says the write succeeded but refresh failed;
  - the stale card remains visibly pending instead of pretending the refreshed state is current.
- No production component code was changed; the existing fail-loud behavior was made auditable by regression evidence.

## Verification

- `npm run test:unit -- tests/unit/admin-board.test.ts -t "expansion is written but decision refresh fails" --reporter=dot`
  - `1 passed | 23 skipped`
- `npm run test:unit:coverage -- tests/unit/admin-board.test.ts --reporter=dot --coverage.reporter=text`
  - `1 file / 24 tests passed`
  - `AdminBoard.vue`: statements `83.5%`, branches `51.18%`, functions `69.51%`, lines `86.16%`
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1039 tests passed`
  - all files: statements `88.92%`, branches `76.16%`, functions `88.57%`, lines `92.12%`

## Notes

- This slice hardens Agent governance observability.
- It does not claim strict v1.0.0 release readiness or gray observation completion.
