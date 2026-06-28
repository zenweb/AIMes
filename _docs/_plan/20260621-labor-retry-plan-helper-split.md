# Plan - Labor Retry Plan Helper Split

Success criteria:

- Labor retry E2E no longer uses a real-dhtmlx helper.
- Real dhtmlx tests keep their existing helper path.
- Focused labor retry browser evidence remains green.

Completed:

- Added `mockLaborRetrySchedulingPlanApis(page)`.
- Switched the `LABOR_EVIDENCE_RETRY_TITLE` setup branch to that helper.
- Verified focused E2E passed 1/1.

Remaining:

- Split the rest of the working diff into a labor-only staged candidate.
- Run staged boundary and focused regression evidence.
