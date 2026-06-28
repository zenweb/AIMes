# 2026-06-14 Issue - Report OTD KPI Commitment Lock and Evidence

## Problem
- `ReportBoard.vue` allowed the OTD KPI commitment button to remain active after a commitment package was generated.
- A repeated click could attempt to write the same customer commitment or outsourcing commitment evidence again.

## Impact
- Duplicate evidence writes can pollute report, assistant, audit replay, and downstream purchase / scheduling evidence chains.
- The issue affects a user-critical existing path: OTD KPI drilldown to customer / outsourcing commitment.

## Resolution
- Added `hasActiveOtdKpiCommitment`.
- Disabled `.kpi-commitment-btn` when the selected KPI already has an active commitment package.
- Added a handler-level early return to prevent duplicate writes even if UI state is bypassed.

## Status
- Resolved and verified with unit, focused Chromium e2e, and full unit coverage.
