# 2026-06-14 Issue - Purchase Supplier Network SLA Evidence

## Issue
- `PurchaseBoard.vue` had failure-path unit coverage for supplier-network audit writes but lacked direct positive unit evidence for successful SLA supplier selection.
- The successful path was covered by a real Chromium e2e, but without a focused unit assertion on the exact decision and OTD evidence payload.

## Resolution
- Added a focused unit test for supplier-network SLA selection.
- Asserted selected supplier, performance metrics, audit id, trace id, OTD evidence id, closed status, affected orders, and visible trace state.

## Status
- Resolved for this slice.
- No production code change required.
