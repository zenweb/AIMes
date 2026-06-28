# 2026-06-16 Admin User Refresh Page Clamp Coverage

- Fixed `AdminBoard.vue` user-list refresh so the current page is clamped back to a valid page after backend-authoritative data shrinks.
- Before this slice, an admin could be on page 2, perform a successful user action, receive a refreshed backend list with only one page, and see an empty table.
- Added a regression test proving a page-2 user action refreshes to the remaining backend user instead of leaving the table blank.
- Kept backend-authority behavior: after write actions, the table still trusts the refreshed backend list rather than locally mutating stale rows.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/admin-board.test.ts -t "keeps refreshed user lists visible when backend results shrink below the current page" --reporter=dot`
  - Expected failure observed: page did not contain `后端保留用户`.
- Green targeted test:
  - Same command passed: `1 passed | 25 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/admin-board.test.ts --reporter=dot --coverage.reporter=text`
  - `26 passed`.
  - `AdminBoard.vue`: statements `85.6%`, branches `53.04%`, functions `73.79%`, lines `87.7%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1055 tests passed`.
  - Totals: statements `89.44%`, branches `76.69%`, functions `89.47%`, lines `92.57%`.
