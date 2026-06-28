# Issue: Scanner page lacked pre-scan guidance links

Date: 2026-06-19

## Problem

The barcode scanner page supports camera scan, manual lookup, evidence writeback, and contextual routing, but the page did not provide a bilingual pre-action prompt or direct links to related evidence/help.

## Impact

Shop-floor users could scan or write evidence without a visible reminder to confirm barcode type, workstation, and evidence owner. This weakened the core product principles for multilingual support, related UI links, and support prompts during complex operations.

## Resolution

Added a scanner guidance section with English/Simplified Chinese copy, links to production reporting, audit replay, reporting evidence, and a local help anchor for scanning operations.

## Evidence

- `npx vitest run tests/unit/scanner-board.test.ts --coverage.enabled=false -t "guides shop-floor scanning"` RED then GREEN.
- `npx vitest run tests/unit/scanner-board.test.ts --coverage.enabled=false` passed.
- `npm run test:unit:coverage` passed: 111 files / 1083 tests.
- `npm run lint` passed.
