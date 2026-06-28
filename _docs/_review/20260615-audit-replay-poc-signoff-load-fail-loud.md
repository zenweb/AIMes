# 2026-06-15 Review - Audit Replay POC Signoff Load Fail Loud

## Decision

The audit replay path now has explicit regression coverage for POC review signoff loader failures.

## What changed

- Added a test that forces the POC review signoff loader to reject.
- Asserted that base replay cards remain visible.
- Asserted that the alert reports the specific POC signoff load failure.

## Why it matters

- POC signoff is a release evidence input; the audit replay panel must stay usable when it is temporarily unavailable.
- The operator needs a loud, specific alert so missing POC signoff evidence is not mistaken for no release-review activity.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1011 tests passed`.
