# 2026-06-06 AdminBoard User Authority Refresh

## Changed

- Updated `AdminBoard` user create, edit, and enable/disable success paths to refresh the user list from the backend authority.
- Added fail-loud handling when a write succeeds but the follow-up user-list refresh fails.
- Preserved demo fallback for initial load only, so post-write state does not silently rely on local draft data.

## Verification

- `npm run test:unit -- tests/unit/admin-board.test.ts`
  - Result: PASS
  - Tests: `10 passed`
- `npm run test:unit:coverage`
  - Result: PASS
  - Test files: `84 passed`
  - Tests: `513 passed`
- `npm run test:e2e -- tests/e2e/admin.spec.ts`
  - Result: PASS
  - Browser: Chromium
  - Tests: `30 passed`
  - Largest JS chunk observed: `817.50 kB`
- Production server + system Chrome screenshot
  - Result: PASS
  - URL observed: `http://127.0.0.1:5173/scheduling/admin`
  - Screenshot: `_docs/_reports/admin-board-user-authority-refresh-20260606.png`

## Coverage Delta

- Global lines: `77.41% -> 77.48%`
- Global branches: `56.77% -> 56.83%`
- `AdminBoard.vue` lines: `73.67% -> 74.91%`
- `AdminBoard.vue` branches: `10.78% -> 12.04%`

## Release Gate Impact

- Improves frontend system administration quality evidence.
- Does not close hosted CI, PostgreSQL/staging, attack-chain A/B/C, security signoff, or gray observation gates.
