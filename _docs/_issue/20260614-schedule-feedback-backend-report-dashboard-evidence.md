# 2026-06-14 Issue - Schedule Feedback Backend Report Dashboard Evidence

## Issue
- Backend report dashboard did not expose the latest auditable schedule adoption feedback.
- This meant the backend report API could return KPI data without the schedule feedback reason, trace ID, or Agent decision reference that already existed elsewhere in the evidence chain.
- Backend Excel export also omitted schedule feedback evidence from the downloaded report artifact.
- Backend PDF export also omitted a schedule feedback evidence section.

## Resolution
- Added backend dashboard support for `ScheduleFeedback`.
- Mapped latest schedule feedback into the shared adoption feedback snapshot shape.
- Added a `排产采纳反馈` worksheet to Excel export when schedule feedback exists.
- Added a `排产采纳反馈` section to PDF export when schedule feedback exists.
- Required reason detail remains the quality gate for surfacing feedback in report dashboard evidence.

## Status
- Resolved for backend dashboard JSON, Excel export, and PDF renderer structure.
- Verified by focused dashboard, focused Excel, focused PDF renderer, and full report controller tests.
