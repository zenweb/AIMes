# 2026-06-16 Admin Create Dialog Draft Reset Plan

## Goal

Polish the existing AdminBoard user-management workflow so abandoned create-user drafts do not leak into later account creation attempts.

## Success Criteria

- Cancelling the create-user dialog clears username, display name, password, and role.
- Reopening the dialog starts from a clean default form.
- Failed create attempts still keep the dialog open for retry.
- Successful create still refreshes from backend authority and then closes cleanly.
- Targeted AdminBoard tests and full frontend unit coverage remain green.

## Execution

1. Add a failing test for cancelled draft cleanup.
2. Confirm the test fails against current behavior.
3. Add minimal create-dialog open/close helpers that reset form state.
4. Re-run the single test, targeted AdminBoard coverage, and full frontend coverage.

## Result

All success criteria were met for this slice.
