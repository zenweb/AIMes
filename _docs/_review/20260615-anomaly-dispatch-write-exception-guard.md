# 2026-06-15 Review: anomaly dispatch write exception guard

Scope:

- Covered the anomaly dispatch boundary where `writeAnomalyDispatchRecord` throws.
- Verified that a failed audit/evidence write cannot produce a false confirmed state.

Findings:

- No production code change was required. The component already catches the exception, syncs the alert, and returns before mutating `latestDispatch` or `dispatchedLaneIds`.
- Together with the storage-unavailable coverage, the dispatch write failure surface now covers both `null` and thrown-error outcomes.

Residual risk:

- Remaining high-value AnomalyBoard gaps are now more likely in backend production event hydration and detail mapping rather than dispatch write failure handling.
