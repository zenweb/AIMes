# 2026-06-30 Quality E2E Alert Disambiguation Closure

## Scope

- `src/frontend/tests/e2e/quality.spec.ts`

## Root Cause

Quality fail-loud tests used broad `qualityBoard.getByRole('alert')` locators. The page can legitimately show multiple alerts at the same time, including startup evidence refresh failures and the specific fail-loud error under test.

Playwright strict mode therefore failed because the locator matched more than one alert.

## Changes

- Narrowed target alert assertions with `filter({ hasText: ... })`.
- Kept all fail-loud expectations intact: each test still verifies the exact failure message and that no false evidence is written.
- Scoped the SPC cleanup assertion to the SPC alert only.

## Verification

- Focused 8-red-cluster run: 8 passed.
- `npm run test:e2e -- tests/e2e/quality.spec.ts`: 26 passed.

## Remaining Risk

Full frontend E2E still needs a fresh complete run after the Quality closure.
