# 2026-06-14 Issue - Architecture Audit Sync

## Issue
Architecture audit tests were red after current release evidence advanced: one test still expected an unsigned security signoff packet, and another required literal `output/` evidence-reference wording.

## Impact
- The architecture suite could not be used as a clean audit signal even though the release evidence had progressed.
- A red architecture suite would obscure real regressions from stale audit expectations.

## Resolution
- Updated the security signoff audit expectation to require the signed packet tokens.
- Added explicit `output/` wording to the attack-chain and release-gate evidence reference helpers.

## Status
- Closed. Architecture tests pass 114/114.
