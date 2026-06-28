# 2026-06-20 Plan - Frontend live preview proxy guard

## Goal
Prevent regression where production preview serves the scheduling UI but API and SignalR traffic no longer reach the live backend on port 5003.

## Steps
1. Inspect current Nuxt proxy configuration.
2. Add a unit-level contract for default `5003` backend routing.
3. Refactor only the proxy config into a pure helper so the contract is testable.
4. Run focused frontend unit tests.
5. Run Nuxt production build.

## Status
- Completed for this slice.
