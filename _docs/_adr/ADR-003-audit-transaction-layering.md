# ADR-003: Audit Transaction Layering

## Status

Accepted

## Context

AIMes has two audit needs:

- Compliance-relevant state changes where business data and audit records must be atomic.
- Access or operation traces where best-effort logging outside the business transaction can be acceptable.

Treating one endpoint filter as the only audit mechanism would hide this difference and could create false confidence for compliance-sensitive workflows.

## Decision

Audit writes are split into two layers:

- Inline audit inside the business transaction for state-changing operations that require business-audit atomicity.
- Endpoint filter audit for access or operation tracing that can tolerate eventual consistency.

Endpoint reviews must classify audit semantics instead of assuming the filter is sufficient.

## Consequences

- Some write paths need explicit application-service or unit-of-work audit integration.
- Filter-based audit remains useful, but only for the right class of event.
- Tests should prove rollback semantics for state-changing operations where audit atomicity matters.

## Verification

- Sprint 3 review records must classify affected endpoints.
- Regression tests should cover at least one rollback case where neither business change nor inline audit survives.
