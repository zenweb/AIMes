# 2026-06-15 Issue - Audit replay residual coverage gaps

## Status

- No runtime issue found in this slice.

## Residual Risk

- AuditDecisionReplayPanel branch coverage remains low at 49.26% because the component contains many specialized evidence mappers.
- Some evidence mapper variants remain unverified, especially POC evidence governance, knowledge governance, barcode rework release stages, and startup provider error branches.

## Mitigation

- Continue using focused tests for audit-significant branches.
- Prefer tests that prove traceability, object links, audit state, and default replay selection over decorative branch coverage.

