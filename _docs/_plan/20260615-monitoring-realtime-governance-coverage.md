# 2026-06-15 Plan: Monitoring realtime governance coverage

Success criteria:
- Cover MonitoringBoard success paths for shopfloor evidence sync and cross-module escalation package creation.
- Cover startup hydration for existing Hypercare and situation governance records.
- Cover SignalR equipment/KPI push handlers and event filtering.
- Cover realtime connection cleanup on unmount.
- Raise focused MonitoringBoard function coverage above 80%.
- Verify focused and full frontend unit coverage.

Execution:
1. Inspect current MonitoringBoard tests, component behavior, and focused coverage gaps.
2. Add success-path governance and realtime tests.
3. Fix test isolation so failure-path mock implementations do not leak into success-path cases.
4. Run focused unit and focused coverage.
5. Run full frontend coverage.

Outcome:
- Completed for this slice. MonitoringBoard focused coverage reached statements 93.68%, branches 87.60%, functions 80.55%, lines 95.95%.
- Full frontend unit coverage passed with 111 files and 924 tests.
- Next work should move to another low-coverage user-critical component instead of continuing MonitoringBoard micro-polish.
