# 2026-06-15 Audit Replay Quality Retraining Load Fail Loud Plan

## Objective

Lock the quality retraining version API rejection path in the audit replay panel with a focused fail-loud regression test.

## Scope

- Simulate quality retraining version loader rejection.
- Verify base replay cards still render.
- Verify the alert names the retraining version load failure.

## Result

- The fail-loud path is now covered by a direct test.
- No production change was required.

## Stop Condition

- Keep the goal active.
- Continue with the next user-critical uncovered replay branch when work resumes.
