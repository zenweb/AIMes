# Next actions - Schedule labor block agent suggestion - 2026-06-22

## Done
- Added coverage for active labor qualification block Agent suggestion generation.
- Verified the stop-work message includes audit evidence and production-start blocking guidance.
- Verified `schedule-board.test.ts`.
- Verified the full frontend unit suite.
- Added browser-level evidence in `src/frontend/tests/e2e/scheduling.spec.ts`.
- Verified `人员无有效替班候选时排产保持停工复核事件` opens the labor stop-work Agent suggestion with audit trace evidence in Chromium.

## Remaining
- Continue covering remaining ScheduleBoard Agent suggestion branches with direct production/audit impact.
