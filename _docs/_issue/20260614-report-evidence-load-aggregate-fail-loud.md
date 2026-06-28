# 2026-06-14 Issue - Report Evidence Load Aggregate Fail Loud

## Issue
ReportBoard optional evidence loading could report only the last failure when several optional evidence sources failed during startup.

## Impact
- Earlier evidence failures were hidden from the user.
- The report surface did not fail loud enough for multi-source evidence degradation.
- Operators could lose context while the dashboard itself still appeared available.

## Resolution
- Collected optional evidence load failures during initial ReportBoard startup.
- Flushed them once as a single aggregated fail-loud alert after optional reads completed.
- Preserved existing immediate error behavior for user-triggered report actions.

## Status
- Closed for frontend aggregation and real-browser visible behavior.
- Backend endpoint availability remains a separate concern if a future slice targets server-side report evidence.
