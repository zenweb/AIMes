# 2026-06-16 Admin Create Dialog Draft Reset

- Hardened the AdminBoard user-management create dialog.
- Fixed cancelled create-user drafts leaking into the next dialog open.
- Added a red-first unit test proving username, display name, password, and role reset after cancel.
- Kept the change scoped to the existing user-management workflow; no new feature scope was added.

## Verification

- Red test before fix: `npm run test:unit -- tests/unit/admin-board.test.ts -t "clears abandoned create-user drafts"` failed because reopened username still contained `qa-admin`.
- Green single test after fix: `1 passed | 27 skipped`.
- Targeted AdminBoard coverage: `28 passed`; statements `87.33%`, branches `57.88%`, functions `76.71%`, lines `89.45%`.
- Full frontend coverage: `111 files / 1061 tests passed`; statements `89.53%`, branches `76.94%`, functions `89.65%`, lines `92.66%`.
