# 2026-06-15 Audit Replay Quality Feedback Evidence Issue

## Issue

Quality recommendation feedback had persistence and OTD evidence coverage, but the audit replay panel did not directly prove that feedback and next-training evidence are visible to users.

## Impact

The system could preserve quality recommendation feedback internally while failing to expose the full trace in audit replay.

## Resolution

Added a replay panel test that loads a quality recommendation feedback record and verifies feedback trace, metrics, effect trend, and next-training trace evidence in the detail panel.

## Verification

Full frontend unit coverage passed: 111 files / 1003 tests.
