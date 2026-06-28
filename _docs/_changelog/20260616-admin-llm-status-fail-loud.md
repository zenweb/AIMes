# 2026-06-16 Admin LLM Status Fail Loud

- Fixed `AdminBoard.vue` LLM status loading so API failures surface a visible admin alert instead of silently rendering only `未连接`.
- Preserved the degraded LLM panel state: provider/model are `-`, connectivity is red, and config is cleared when the status/config load fails.
- Added a regression test proving the LLM tab shows both the disconnected state and the backend failure reason.
- Kept this slice scoped to existing Admin LLM settings behavior; no new LLM provider or configuration feature was added.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/admin-board.test.ts -t "fails loud when llm status cannot be loaded" --reporter=dot`
  - Expected failure observed: unable to find `[role="alert"]` while the LLM panel only showed `未连接`.
- Green targeted test:
  - Same command passed: `1 passed | 26 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/admin-board.test.ts --reporter=dot --coverage.reporter=text`
  - `27 passed`.
  - `AdminBoard.vue`: statements `86.8%`, branches `57.88%`, functions `74.86%`, lines `88.88%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 files / 1056 tests passed`.
  - Totals: statements `89.51%`, branches `77.01%`, functions `89.54%`, lines `92.64%`.
