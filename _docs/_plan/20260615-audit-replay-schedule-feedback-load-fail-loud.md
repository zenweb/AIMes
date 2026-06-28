# 2026-06-15 Audit Replay Schedule Feedback Load Fail Loud Plan

## Objective

Lock the schedule adoption feedback audit list failure path in the audit replay panel with a focused fail-loud regression test.

## Scope

- Simulate `ScheduleAdoptionFeedbackUpsert` audit list loading failure through the real audit API mock.
- Verify base replay cards still render.
- Verify the alert names the schedule feedback audit load failure.

## Result

- The fail-loud path is now covered by a direct test.
- No production change was required.

## Stop Condition

- Keep the goal active.
- Continue with the next user-critical uncovered replay branch when work resumes.
