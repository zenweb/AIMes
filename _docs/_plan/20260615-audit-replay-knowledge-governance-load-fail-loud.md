# 2026-06-15 Audit Replay Knowledge Governance Load Fail Loud Plan

## Objective

Lock the knowledge governance review API rejection path in the audit replay panel with a focused fail-loud regression test.

## Scope

- Simulate knowledge governance review loader rejection.
- Verify base replay cards still render.
- Verify the alert names the knowledge governance load failure.

## Result

- The fail-loud path is now covered by a direct test.
- No production change was required.

## Stop Condition

- Keep the goal active.
- Continue with the next user-critical uncovered replay branch when work resumes.
