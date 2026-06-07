# ADR-002: Split v1.0.0 and v1.1 Release Criteria

## Status

Accepted

## Context

The original schedule treated all remediation work as one release target. After review, the plan was split because safety-critical remediation and later DX/performance/test improvements have different risk profiles and different observation requirements.

The team model is one developer plus AI, so coding throughput is not the only constraint. Human review bandwidth and production observation time are the real release gates.

## Decision

`v1.0.0` means phase one only: Sprint 0-3 remediation, first gray release, security self-review, manual attack-chain validation, maintainer sign-off, and two calendar weeks without P0/P1 incidents.

`v1.1` means phase two: Sprint 4-6 plus architecture/test/DX follow-up after the v1.0.0 safety baseline has been proven.

## Consequences

- Passing local tests or CI is not enough to tag `v1.0.0`.
- Sprint 4-6 work can continue, but it must not blur the v1.0.0 release claim.
- Changelog and release notes must distinguish phase-one readiness from phase-two improvement work.

## Verification

- Release documentation must name the exact version target.
- `v1.0.0` cannot be marked complete without gray-run and two-week observation evidence.
