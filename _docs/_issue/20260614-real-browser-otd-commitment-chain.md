# 2026-06-14 Issue - Real Browser OTD Commitment Chain

## Issue
OTD KPI commitment helper contracts had unit evidence, but the user-facing Report -> Chat/Schedule -> Audit chain needed direct real-browser proof.

## Impact
- Unit tests could pass while cross-page routing, rendering, CSV export, or audit replay drifted.
- The product-quality claim for this existing feature would remain weaker than boutique-level evidence.

## Resolution
- Reused existing focused Playwright scenarios in `tests/e2e/report.spec.ts`.
- Verified both customer commitment and outsourcing commitment chains through Nuxt production build and Chromium.
- Captured the result in `_docs/_reports/frontend-real-browser-otd-commitment-chain-20260614.md`.

## Status
- Closed for targeted frontend real-browser evidence.
- Gray observation remains owner-deferred/skipped, not completed.
