# 2026-06-15 Review - Audit Replay Schedule Feedback Load Fail Loud

## Decision

The audit replay path now has explicit regression coverage for schedule adoption feedback audit list failures.

## What changed

- Added a test that forces `ScheduleAdoptionFeedbackUpsert` audit list loading to fail.
- Asserted that base replay cards remain visible.
- Asserted that the alert reports the specific schedule feedback audit load failure.

## Why it matters

- Schedule adoption feedback is a key explainability and audit trail for AI scheduling decisions.
- Operators need the replay panel to stay usable and fail loud when schedule feedback audit evidence is temporarily unavailable.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1013 tests passed`.
- Regression refresh on 2026-06-19 passed: replay panel `56 tests`, full frontend `111 files / 1083 tests`, and lint.
