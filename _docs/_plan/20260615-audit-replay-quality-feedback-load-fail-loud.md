# 2026-06-15 Audit Replay Quality Feedback Load Fail Loud Plan

## Objective

Lock the quality feedback input load failure path in the audit replay panel with a focused fail-loud regression test.

## Scope

- Simulate quality recommendation feedback API rejection.
- Simulate quality retraining version malformed payload.
- Verify base replay cards still render.
- Verify the alert names both failed inputs.

## Result

- The fail-loud path is now covered by a direct test.
- No production change was required.

## Stop Condition

- Keep the goal active.
- Continue with the next user-critical uncovered replay branch when work resumes.
