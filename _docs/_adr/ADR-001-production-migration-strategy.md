# ADR-001: Production Migration Strategy

## Status

Accepted

## Context

AIMes is maintained by one developer with AI assistance. There is no dedicated DBA available for production incidents, and manufacturing databases can be sensitive to startup-time schema changes, table locks, and unreviewed migration side effects.

The remediation plan originally discussed automatic migration hooks, but the reviewed plan rejects application startup schema mutation for production.

## Decision

Production deployments must run EF Core migrations as an explicit deployment step. The application may validate schema readiness at startup, but it must not silently run `MigrateAsync()` in production startup.

Development and demo paths may keep separate local initialization behavior where already documented, but that does not change the production rule.

## Consequences

- Migration execution is slower and more manual, but the operator can review timing, lock risk, and rollback before applying schema changes.
- Startup failure is preferred over implicit production mutation when schema version is not ready.
- Release checklists must include migration execution and rollback verification.

## Verification

- Sprint 0 remediation records must show the chosen migration path.
- Production release evidence must include the migration command or CI step used before app startup.
