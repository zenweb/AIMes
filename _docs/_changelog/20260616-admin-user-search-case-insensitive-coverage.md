# 2026-06-16 Admin User Search Case Insensitive Coverage

- Fixed `AdminBoard.vue` user search so username and display name matching is case-insensitive.
- Before this slice, the search term was normalized to lowercase but `username` and `displayName` were compared in their original case.
- Added a regression test proving an admin searching `qa` can find a user displayed as `QA Lead`.
- Kept the existing filtered-table behavior and page reset watcher unchanged.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/admin-board.test.ts -t "matches user search case-insensitively across username and display name" --reporter=dot`
  - Expected failure observed: page did not contain `QA Lead`.
- Green targeted test:
  - Same command passed: `1 passed | 24 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/admin-board.test.ts --reporter=dot --coverage.reporter=text`
  - `25 passed`.
  - `AdminBoard.vue`: statements `84.24%`, branches `51.55%`, functions `71.12%`, lines `86.68%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1054 tests passed`.
  - Totals: statements `89.36%`, branches `76.59%`, functions `89.29%`, lines `92.51%`.
