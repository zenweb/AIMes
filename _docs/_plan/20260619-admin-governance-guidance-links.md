# Plan: Admin governance guidance links

Date: 2026-06-19
Status: Completed

## Success criteria

- AdminBoard must show Simplified Chinese and English governance guidance before high-risk actions.
- The guidance must link to related audit and document governance surfaces.
- A clickable help entry must resolve to `#admin-governance-help`.
- The regression test must fail before implementation and pass after it.
- AdminBoard and frontend regression checks must remain green.

## Implementation

- Added an `admin-guidance` section at the top of `AdminBoard.vue`.
- Added links to `/audit-logs`, `/knowledge/documents`, and `#admin-governance-help`.
- Added compact help text for impact-scope confirmation before config or access changes.
- Added a focused unit test in `tests/unit/admin-board.test.ts`.

## Verification

- Targeted RED confirmed `.admin-guidance` was missing before implementation.
- Targeted GREEN passed after the UI update.
- `npx vitest run tests/unit/admin-board.test.ts --coverage.enabled=false`: 29 passed.
- `npm run test:unit:coverage`: 111 files / 1083 tests passed.
- `npm run lint`: passed.
