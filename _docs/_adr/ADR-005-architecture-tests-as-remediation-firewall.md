# ADR-005: Architecture Tests as Remediation Firewall

## Status

Accepted

## Context

Several remediation issues were structural: mutable process-local state, direct console logging, blocking async calls, dependency direction drift, and test infrastructure regressions. Manual review alone is not reliable enough for these patterns.

The plan considered Roslyn analyzers, but a dedicated analyzer project is not required for every initial guardrail.

## Decision

Use `MES.ArchitectureTests` as the first remediation firewall for enforceable structural rules. Where a full analyzer is not yet justified, architecture tests plus PR checklist items are acceptable as the initial CI gate.

Roslyn analyzers remain an option for rules that need deeper syntax or semantic analysis.

## Consequences

- Structural regressions can fail CI without waiting for human review.
- Some rules remain approximate and must be documented as such.
- PR reviewers still need to verify checklist items not covered by automated tests.

## Verification

- CI must run `MES.ArchitectureTests`.
- Each new structural guardrail should include a red/green note in the same-day review or changelog.
