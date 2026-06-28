# 2026-06-14 Issue - Schedule Feedback Report Agent Decision Evidence

## Issue
- Schedule feedback report evidence included the adoption reason and trace ID, but omitted the Agent decision reference already present on `ScheduleFeedbackSnapshot`.
- This weakened report-level traceability from "human accepted this recommendation" back to "which Agent decision was accepted".

## Resolution
- Added `evidenceRef` to OTD evidence-chain records.
- Mapped schedule feedback `agentDecisionId` into report drilldown and CSV export.
- Preserved the older wording when no Agent decision reference is available.

## Status
- Resolved for this slice.
- Verified by focused unit, full report unit, and real Chromium report CSV evidence.
