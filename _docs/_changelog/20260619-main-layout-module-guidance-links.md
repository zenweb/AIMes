# Changelog: MainLayout module guidance links

Date: 2026-06-19

## Changed

- Added a shell-level module guidance section to `MainLayout.vue`.
- The active scheduling module now shows Simplified Chinese and English pre-action guidance before complex operations.
- Added contextual links from the active module surface to:
  - `AI 排产`
  - `报表中心`
  - `审计日志`
  - `#module-help`
- Added an in-page `#module-help` support section that reminds operators to preserve source evidence, owner, target module, and audit trail before complex actions.
- Added responsive styling in `MainLayout.css` so the guidance links wrap instead of overlapping on narrower screens.
- Added unit coverage in `main-layout.test.ts` proving the guidance copy, related links, and help anchor render for `/scheduling`.

## Verification

- RED: `npx vitest run tests/unit/main-layout.test.ts --coverage.enabled=false -t "guides operators from the active module"` failed because `.module-guidance` was missing.
- GREEN: the same targeted test passed after adding the guidance surface.
- `npx vitest run tests/unit/main-layout.test.ts --coverage.enabled=false`: 5 passed.
- `npm run test:unit:coverage`: 111 files / 1084 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- Production-preview browser evidence on `http://127.0.0.1:4174/scheduling/scheduling`:
  - `_docs/_reports/main-layout-module-guidance-browser-20260619.json`
  - `_docs/_reports/main-layout-module-guidance-browser-20260619.png`

## Release note

This improves the existing application shell and does not add new feature scope. Strict v1.0.0 release readiness is still not claimed while the gray observation gate remains deferred.
