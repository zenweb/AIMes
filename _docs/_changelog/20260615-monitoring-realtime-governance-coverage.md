# 2026-06-15 Changelog: Monitoring realtime governance coverage

- Added MonitoringBoard coverage for successful shopfloor situation evidence sync into the OTD evidence chain.
- Added coverage for successful cross-module situation escalation package creation and rendering.
- Added startup coverage for existing Hypercare and closed situation governance records.
- Added realtime SignalR handler coverage for equipment metrics, KPI pushes, event filtering, and connection cleanup on unmount.
- Kept this as a test-only hardening slice; no production behavior was changed.

Verification:
- `npm run test:unit -- tests/unit/monitoring-board.test.ts`: 13 passed.
- `npm run test:unit:coverage -- tests/unit/monitoring-board.test.ts --coverage.include=src/components/monitoring/MonitoringBoard.vue --coverage.reporter=json-summary --coverage.reporter=text-summary`: passed.
- Focused MonitoringBoard coverage: statements 93.68%, branches 87.60%, functions 80.55%, lines 95.95%.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 924 tests passed; global lines 89.19%.
- Local backend/API evidence remains on `http://localhost:5002`; this slice did not reintroduce host port `5000`.
