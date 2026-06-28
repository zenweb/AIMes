# 2026-06-15 Issue: RiskActionQueuePanel cross-module source coverage

## Problem

`RiskActionQueuePanel` had low branch coverage around risk sources that feed the queue from production anomalies and AI assistant recovery packages.

## Impact

- A production anomaly might fail to appear as the first risk card without a focused test catching the regression.
- Closed assistant recovery packages could lose purchase/quality responsibility evidence in the risk queue.
- Quality-only assistant recovery packages could lose their escalated status or quality trace context.

## Resolution

- Added targeted tests to `risk-action-queue-panel.test.ts`.
- Covered production anomaly hydration, closed assistant recovery evidence, and active quality-only assistant recovery evidence.

## Verification

- Target unit: 13/13 passed.
- Focused branch coverage improved from 44% to 73%.
