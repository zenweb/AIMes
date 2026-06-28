# 2026-06-15 Plan: purchase material correction evidence

## Success Criteria
- A routed material anomaly can be corrected from PurchaseBoard.
- The correction writes supplier-risk audit evidence and OTD evidence.
- The UI locks the corrective trace and does not raise a false alert.

## Steps
1. Read existing PurchaseBoard tests and implementation around supplier network, outsourcing, and material correction.
2. Avoid re-polishing already covered supplier network and outsourcing paths.
3. Add a focused positive regression for material anomaly supplier correction.
4. Run targeted test, full PurchaseBoard unit test, and focused coverage.

## Stop Condition
- Tests prove the positive material correction path and no production change is needed unless the regression fails.
