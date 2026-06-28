# Risk action queue aggregate source failures next actions

Date: 2026-06-19

## Next actions

- Continue selecting slices by coverage leverage plus user-critical path value.
- Avoid repeating RiskActionQueuePanel polish unless the next issue protects correctness, recovery, observability, or operator decision evidence.
- Consider the next high-leverage candidates from current coverage: `BomBoard.vue`, `ProductionBoard.vue`, `PurchaseBoard.vue`, or `QualityBoard.vue`.
- Keep backend/staging work on `5003`, not `5000`.
- Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.
