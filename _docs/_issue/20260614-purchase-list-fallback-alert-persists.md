# Issue - Purchase list fallback alert persists

## Problem
- When initial purchase list loading failed, `PurchaseBoard` displayed demo purchase orders with a fail-loud alert.
- The alert used the operation notification lane.
- A later successful operation, such as confirming a submitted purchase order, called `clearNotification()` and removed the unresolved list fallback warning.

## Impact
- Operators could believe the board had recovered from the initial list API failure even though the screen was still based on fallback data.
- This weakened fail-loud evidence on a user-critical procurement path.

## Fix
- Store the initial purchase list fallback warning via `appendStartupSyncFailure(...)`.
- The alert now persists across later successful order actions.

## Verification
- Unit and Chromium tests cover the failing path.
- Full PurchaseBoard unit and Chromium suites passed.
