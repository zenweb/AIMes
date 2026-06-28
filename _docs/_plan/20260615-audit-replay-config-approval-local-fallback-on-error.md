# 2026-06-15 Audit Replay Config Approval Local Fallback On Error Plan

## Objective

Lock the configuration approval backend-error local fallback path in the audit replay panel with a focused regression test.

## Scope

- Simulate backend configuration approval loader rejection.
- Provide local configuration approval evidence.
- Verify local approval badge, approval row, replay details, and fail-loud alert.

## Result

- The fallback path is now covered by a direct test.
- No production change was required.

## Stop Condition

- Keep the goal active.
- Continue with the next user-critical uncovered replay branch when work resumes.
