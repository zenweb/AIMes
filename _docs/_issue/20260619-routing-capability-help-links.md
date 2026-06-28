# 2026-06-19 Issue - Routing Capability Browser Evidence Blocker

## Status
Resolved for this slice.

## What Happened
- Code-level verification passed for the routing capability help/link slice.
- Real browser verification was attempted after installing Playwright Chromium.
- Nuxt dev server startup failed with:
  - `No entry found in rollupOptions.input`
- Follow-up verification used production build + `scripts/preview.mjs` on port 4173 instead of Nuxt dev.
- Real Chromium verification passed on `http://127.0.0.1:4173/scheduling/routing`.

## Impact
- The component behavior is covered by targeted unit tests, full frontend coverage, lint, and real browser preview evidence.

## Known Good Evidence
- `routing-board.test.ts`: 13 passed.
- Full frontend coverage: 111 files / 1082 tests passed.
- Lint: passed.
- Browser evidence report: `_docs/_reports/routing-capability-help-links-browser-20260619.json`.
- Browser screenshot: `_docs/_reports/routing-capability-help-links-browser-20260619.png`.

## Required Follow-Up
- Keep Nuxt dev startup investigation as a separate DX issue if local hot reload remains important.
- Do not treat Nuxt dev instability as blocking this slice because production build + preview evidence is now sealed.
