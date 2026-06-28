# 2026-06-15 Anomaly production event hydration next actions

- Continue hardening anomaly board uncovered paths by targeting backend-first reader failure and local fallback behavior if coverage leverage remains high.
- Consider a utility-level slice for `production-anomaly-sync.ts` backend failure fallback to local storage.
- Keep the list-first/detail-mapped behavior intact when adjusting anomaly event sync contracts.
- Avoid adding new anomaly features until the current event hydration, dispatch, recovery, and evidence paths are covered.
