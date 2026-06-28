# 2026-06-15 Review - Audit Replay OTD Evidence Load Fail Loud

## Decision

The audit replay path now has explicit regression coverage for OTD evidence chain loader failures.

## What changed

- Added a test that forces the OTD evidence chain loader to throw.
- Asserted that base replay cards remain visible.
- Asserted that the alert reports the specific OTD evidence chain load failure.

## Why it matters

- OTD evidence is a core delivery proof input; the audit replay panel must stay usable when it is temporarily unavailable.
- The operator needs a loud, specific alert so missing OTD evidence is not mistaken for no delivery evidence activity.

## Verification

- Targeted unit test passed.
- Targeted coverage passed.
- Related replay regression passed.
- Full frontend unit coverage passed at `111 files / 1010 tests passed`.
