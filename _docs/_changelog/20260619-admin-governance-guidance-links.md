# Changelog: Admin governance guidance links

Date: 2026-06-19

## Changed

- Added a bilingual governance guidance panel to `AdminBoard.vue`.
- Added contextual links for:
  - `审计回放` -> `/audit-logs`
  - `文档治理` -> `/knowledge/documents`
  - `帮助：系统治理支持` -> `#admin-governance-help`
- Added a compact help anchor that reminds operators to confirm impact scope before saving configuration or changing access.
- Added unit coverage proving the guidance text, related links, and help anchor render.

## Verification

- RED: `npx vitest run tests/unit/admin-board.test.ts --coverage.enabled=false -t "guides system administrators with bilingual governance links before high-risk changes"` failed because `.admin-guidance` was missing.
- GREEN: the same targeted test passed after adding the guidance panel.
- `npx vitest run tests/unit/admin-board.test.ts --coverage.enabled=false` passed: 29 tests.
- Regression refresh: `npm run test:unit:coverage` passed: 111 files / 1083 tests.
- Coverage totals: statements 89.71%, branches 77.15%, functions 89.92%, lines 92.83%.
- `npm run lint` passed.
