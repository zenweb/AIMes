# ADR-010: CC Remediation Audit Decisions

## Status

Accepted

## Context

The CC remediation plan was reviewed and reshaped after CEO review, engineering review, external model feedback, and confirmation that the real team is one developer plus AI.

The final plan keeps the scope but changes the execution model: review bandwidth and calendar observation are treated as first-class constraints, while coding throughput is no longer modeled as a multi-person schedule.

## Decision

The remediation program follows these accepted decisions:

- Keep all scoped remediation work; defer phase-two items by cut line when review bandwidth is tight instead of deleting them.
- Treat Sprint 0-3 as the `v1.0.0` safety baseline and Sprint 4-6 as `v1.1` follow-up.
- Require explicit production migration steps instead of startup-time production migration.
- Classify audit paths by transaction semantics.
- Keep UoW conversion narrow and transaction-owned.
- Use architecture tests and PR checklist gates as the initial remediation firewall.
- Use AI-assisted security and compliance review only as a fallback, with maintainer manual sign-off.

## Consequences

- Completion claims must name the exact release phase and evidence level.
- Local implementation progress does not satisfy gray release, security sign-off, or two-week observation gates.
- Documentation, changelog, review, todo, and issue records are part of the remediation evidence.

## Verification

- Same-day remediation documents must record implementation, verification, and remaining risks.
- `v1.0.0` must not be tagged until the phase-one release gates have real evidence.
- `v1.1` work can be implemented before final release, but it must not be used to bypass `v1.0.0` gates.
