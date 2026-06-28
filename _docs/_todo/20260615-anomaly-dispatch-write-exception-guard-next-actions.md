# 2026-06-15 Anomaly dispatch write exception guard next actions

- Continue hardening `AnomalyBoard` by targeting backend production anomaly event hydration.
- Verify that a production anomaly backend event is inserted at the top of the list and opens with backend-derived detail.
- Keep anomaly routing evidence fail-loud behavior intact when refactoring dispatch sync utilities.
- Avoid broadening anomaly features until the current routing, recovery, and evidence paths are covered.
