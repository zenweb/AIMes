# 2026-06-19 Plan - Risk SLA Guidance Links

## Success Criteria
- Risk SLA review workflow shows bilingual guidance before review package generation or closure.
- Guidance links to Scheduling, Reports, Audit trail, and Help.
- SLA review panel is programmatically associated with the guidance.
- Existing risk queue behavior remains green.

## Execution
1. Confirmed ScheduleBoard and DocumentUpload already had guidance/help coverage, then selected RiskActionQueuePanel as the next real gap.
2. Wrote RED unit test for SLA guidance text, links, and `aria-describedby`.
3. Implemented minimal template and style changes.
4. Verified targeted test, 16-test focused suite, full coverage, lint, build, and real browser rendering.

## Stop Condition
- This slice stops after Risk SLA guidance/link/help behavior is verified.
- The wider active goal remains open because gray observation is deferred.
