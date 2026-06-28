# 2026-06-16 BOM Pagination Detail Reset

- Hardened the BomBoard pagination workflow.
- Cleared stale selected BOM detail and explosion results when operators move to another BOM list page.
- Prevented the right-side engineering constraints, ECN actions, and kitting package actions from continuing to reference a BOM from the previous page.
- Kept the change scoped to existing BOM list/detail behavior; no new feature scope was added.

## Verification

- Red test before fix: `npm run test:unit -- tests/unit/bom-board.test.ts -t "loads the requested BOM page"` failed because page 2 listed `产品C 物料清单` while the detail panel still rendered `产品A 物料清单`.
- Green single test after fix: `1 passed | 20 skipped`.
- Targeted BomBoard coverage: `21 passed`; statements `84.61%`, branches `76.54%`, functions `92.3%`, lines `88.7%`.
- Full frontend coverage: `111 files / 1061 tests passed`; statements `89.53%`, branches `76.94%`, functions `89.65%`, lines `92.66%`.

## Tooling Note

- Do not run multiple Vitest coverage commands concurrently in `src/frontend`; they share `coverage/.tmp` and can invalidate each other.
