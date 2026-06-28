# 2026-06-15 Audit Replay Quality Feedback Evidence Plan

## Objective

Bridge the quality recommendation feedback evidence loop into the user-facing audit replay panel.

## Scope

- Select a low-coverage, user-critical component by current coverage summary.
- Add focused coverage for quality recommendation feedback replay.
- Verify targeted, related, and full frontend unit coverage.

## Completed

- Chose `AuditDecisionReplayPanel.vue` based on coverage and audit criticality.
- Added quality recommendation feedback replay test.
- Verified next-training trace and feedback metrics are visible in replay detail.
- Verified all frontend unit tests.

## Next Candidate

Continue with audit replay only where a missing branch affects fail-loud behavior, default selection, or user-visible traceability.
