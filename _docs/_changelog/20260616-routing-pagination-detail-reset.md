# 2026-06-16 Routing Pagination Detail Reset

- Fixed `RoutingBoard.vue` pagination so changing pages clears the previously selected route detail.
- Prevented a stale detail panel from showing a route from the previous page while the list already displays the newly loaded page.
- Kept route selection, capability validation, and release evidence behavior unchanged.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/routing-board.test.ts -t "loads the requested page when operators use pagination" --reporter=dot`
  - Expected failure observed: page 2 list showed `液压阀体工艺路线` while the detail panel still showed `传动轴总成工艺路线`.
- Green targeted test:
  - Same command passed: `1 passed | 11 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/routing-board.test.ts --reporter=dot --coverage.reporter=text`
  - `12 passed`.
  - `RoutingBoard.vue`: statements `85.89%`, branches `77.98%`, functions `85.18%`, lines `91.04%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 files / 1059 tests passed`.
  - Totals: statements `89.51%`, branches `77.01%`, functions `89.54%`, lines `92.64%`.
