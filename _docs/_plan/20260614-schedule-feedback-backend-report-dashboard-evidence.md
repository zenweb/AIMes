# 2026-06-14 Plan - Schedule Feedback Backend Report Dashboard Evidence

## Goal
- Make backend `/api/v1/report/dashboard`, Excel export, and PDF export expose the latest auditable schedule adoption feedback evidence.

## Success Criteria
- A focused integration test first fails because dashboard `ScheduleFeedback` is missing.
- Dashboard response includes decision label, category label, required reason detail, objective label, trace ID, and Agent decision ID.
- A focused Excel integration test first fails because the downloaded workbook has no `排产采纳反馈` worksheet.
- Excel export includes the same decision, reason, objective, trace ID, and Agent decision ID evidence.
- A focused PDF renderer architecture test first fails because the renderer has no `排产采纳反馈` section.
- PDF export renders the same decision, reason, objective, trace ID, and Agent decision ID evidence.
- Existing report controller tests stay green.
- Gray observation is explicitly skipped/deferred by owner direction and does not block the slice.

## Execution
- Add focused integration coverage for backend report dashboard schedule feedback.
- Add `ScheduleFeedback` to the report dashboard DTO.
- Load latest feedback through the schedule repository in report endpoint construction.
- Map feedback into `AdoptionFeedbackSnapshotDto` with fail-loud blank-reason suppression.
- Add Excel export worksheet coverage and implementation for schedule feedback evidence.
- Add PDF renderer coverage and implementation for schedule feedback evidence.
- Run focused and full report controller verification.

## Result
- Success criteria met for backend dashboard JSON, Excel export, and PDF renderer structure.
- Backend PDF byte-level text extraction remains a possible follow-up if artifact inspection is selected next.
