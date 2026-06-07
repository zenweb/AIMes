# 2026-06-06 AdminBoard User Authority Refresh

## Scope

- Target: `AdminBoard.vue` system user management write path.
- User path verified: create user, edit user, enable/disable user, then reconcile the visible list with backend authority.
- Boundary: frontend quality evidence only; this does not close release B-track gates.

## Change

- Added backend-authoritative user refresh after successful create, edit, and enable/disable operations.
- Kept write success from pretending the UI is current when the follow-up user-list refresh fails.
- Added fail-loud refresh failure messaging so the operator can see that the current list may be stale.
- Kept the initial offline-demo fallback for first load only.

## Verification

- Command: `npm run test:unit -- tests/unit/admin-board.test.ts`
  - Result: PASS
  - Tests: `10 passed`
- Command: `npm run test:unit:coverage`
  - Result: PASS
  - Test files: `84 passed`
  - Tests: `513 passed`
- Command: `npm run test:e2e -- tests/e2e/admin.spec.ts`
  - Result: PASS
  - Browser: Chromium
  - Tests: `30 passed`
  - Production build: PASS before browser run
  - Largest JS chunk observed: `817.50 kB`
- Command: production server + system Chrome screenshot
  - Result: PASS
  - URL observed: `http://127.0.0.1:5173/scheduling/admin`
  - Visible text includes: `系统管理`, `用户管理`, `角色权限`, `Agent 治理`, `admin`, `管理员`
  - Screenshot: `_docs/_reports/admin-board-user-authority-refresh-20260606.png`

## Coverage Delta

- Global lines: `77.41% -> 77.48%`
- Global statements: `73.78% -> 73.86%`
- Global branches: `56.77% -> 56.83%`
- `AdminBoard.vue` lines: `73.67% -> 74.91%`
- `AdminBoard.vue` statements: `67.73% -> 69.02%`
- `AdminBoard.vue` functions: `19.49% -> 19.87%`
- `AdminBoard.vue` branches: `10.78% -> 12.04%`

## Release Gate Impact

- Improves system administration correctness evidence for user and permission governance.
- Does not close hosted CI, PostgreSQL/staging, attack-chain A/B/C, security signoff, first gray deployment, or observation-window gates.

## Environment Notes

- In-app Browser bridge could not start because the local Node REPL kernel was affected by the user-profile `package.json` module mode. No user-profile files were changed.
- MCP browser could not reach host `127.0.0.1`; local Playwright with system Chrome was used for screenshot evidence instead.
