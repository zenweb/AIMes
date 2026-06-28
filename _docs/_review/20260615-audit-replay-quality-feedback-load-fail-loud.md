# 2026-06-15 Review - Audit Replay Quality Feedback Load Fail Loud

## Decision

The audit replay path now has explicit regression coverage for quality feedback input load failures.

## What changed

- Added a test that forces quality recommendation feedback loading to reject.
- Added a malformed quality retraining version payload in the same scenario.
- Asserted that base replay cards remain visible and the alert reports both failures.

## Why it matters

- The audit replay panel must not become blank when quality knowledge inputs fail.
- The operator needs a loud, specific alert so the missing quality replay evidence is not mistaken for no audit activity.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1006 tests passed`.
