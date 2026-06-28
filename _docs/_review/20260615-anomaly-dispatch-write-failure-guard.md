# 2026-06-15 Review: anomaly dispatch write failure guard

Scope:

- Covered the user-critical anomaly event routing boundary where `writeAnomalyDispatchRecord` returns `null`.
- Verified the UI does not mark the lane as confirmed until durable evidence exists.

Findings:

- No production fix was required. The component already keeps `dispatchedLaneIds` and `latestDispatch` unchanged on write failure.
- The new test prevents a regression where a failed dispatch could be shown as confirmed or produce a false trace.

Residual risk:

- This slice covers the `null` write result path. A thrown write exception remains handled by production code but can be covered in a later micro-slice if needed.
