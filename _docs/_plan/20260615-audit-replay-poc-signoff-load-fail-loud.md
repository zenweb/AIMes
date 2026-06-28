# 2026-06-15 Audit Replay POC Signoff Load Fail Loud Plan

## Objective

Lock the POC review signoff loader failure path in the audit replay panel with a focused fail-loud regression test.

## Scope

- Simulate POC review signoff loader rejection.
- Verify base replay cards still render.
- Verify the alert names the POC signoff load failure.

## Result

- The fail-loud path is now covered by a direct test.
- No production change was required.

## Stop Condition

- Keep the goal active.
- Continue with the next user-critical uncovered replay branch when work resumes.
