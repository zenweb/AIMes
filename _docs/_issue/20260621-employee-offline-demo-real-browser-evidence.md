# Issue: Employee Offline Demo Real Browser Evidence

## Problem
The Employee offline-demo fix had unit and manual browser evidence, but the exact user-visible entry path was not yet captured as a repeatable e2e command.

## Impact
- Future regressions could reintroduce raw `Offline demo mode skipped backend request` text without a focused browser check failing.
- Manual verification evidence is harder to repeat during Sprint 0 baseline work.

## Resolution
- Added a focused Playwright e2e case to `employee.spec.ts`.
- Archived the current passing browser evidence report.

## Verification
- Production Nuxt build plus Chromium e2e passed, 1/1.

