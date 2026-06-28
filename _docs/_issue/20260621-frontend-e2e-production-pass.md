# 2026-06-21 Issue - Production E2E Route Loop and Anomaly Click Interception

## Problem

`production.spec.ts` failed in two ways:

- Old E2E auth setup used only a token and did not preserve the current offline demo contract across protected route entries.
- The anomaly page event-center area intercepted clicks on anomaly cards in real Chromium.

## Root Cause

- The auth middleware clears demo tokens on protected routes unless the route explicitly carries offline demo intent.
- The anomaly page layout allowed the event-center/event-bridge section to overlap the scrollable anomaly list click target.

## Resolution

- Seeded complete offline demo session data in the test setup.
- Added explicit offline demo query intent for cross-module E2E navigation.
- Adjusted anomaly board CSS so the event center and anomaly list occupy stable, non-overlapping regions.

## Verification

- `npm run test:e2e -- tests/e2e/production.spec.ts`
- Result: `25 passed (29.5s)`
