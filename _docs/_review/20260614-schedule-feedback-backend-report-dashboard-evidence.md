# 2026-06-14 Review - Schedule Feedback Backend Report Dashboard Evidence

## Scope
- Reviewed the backend report dashboard boundary for schedule adoption feedback traceability.

## Findings
- Local report CSV and audit replay already carried schedule feedback reason, trace, and Agent decision evidence.
- Backend `/api/v1/report/dashboard` did not expose the latest schedule feedback snapshot, leaving the backend report API weaker than the frontend evidence path.
- A focused integration test confirmed the gap by failing on `ScheduleFeedback` being null.
- Backend Excel export also lacked a worksheet for schedule feedback evidence, so downloaded report artifacts did not match the dashboard evidence boundary.
- Backend PDF export lacked a rendered section for schedule feedback evidence.

## Resolution
- Added `ScheduleFeedback` to `ReportDashboardDto`.
- Loaded the latest feedback from `IScheduleRepository.GetLatestFeedbackAsync`.
- Mapped the feedback into `AdoptionFeedbackSnapshotDto`, including `ReasonDetail`, `AiTraceId`, and `AgentDecisionId`.
- Preserved fail-loud behavior by suppressing records with blank `ReasonDetail` from the dashboard snapshot.
- Added an Excel `排产采纳反馈` worksheet when schedule feedback exists.
- Added a PDF `排产采纳反馈` section when schedule feedback exists.
- Added test isolation cleanup for schedule feedback rows so latest-feedback assertions are not affected by earlier tests in the same integration class.

## Verification
- Focused red/green integration test passed after implementation.
- Focused Excel export red/green integration test passed after implementation.
- Focused PDF renderer architecture red/green test passed after implementation.
- Full `ReportControllerTests`: 9/9 passed.

## Residual Risk
- This slice covers backend dashboard JSON, Excel export content, and PDF renderer structure. PDF text extraction/assertion is still not available in the repo and can be deepened later if stronger PDF artifact inspection becomes the next priority.
- Gray observation remains intentionally skipped/deferred by owner direction.
