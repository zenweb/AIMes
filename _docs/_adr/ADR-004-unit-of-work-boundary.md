# ADR-004: Unit of Work Boundary

## Status

Accepted

## Context

Sprint 2 introduces `IUnitOfWork` for critical multi-step workflows. If repositories inside a unit-of-work scope call `SaveChangesAsync()` independently, the transaction boundary becomes misleading and rollback semantics can break.

The remediation plan intentionally limits the first UoW conversion to high-risk aggregates instead of forcing a large repository rewrite.

## Decision

Repositories used inside the new unit-of-work transaction boundary must stage changes only. `IUnitOfWork.CommitAsync` owns `SaveChangesAsync()` for those workflows.

Repositories not yet migrated may keep existing behavior until their path is intentionally converted.

## Consequences

- The conversion stays surgical and reviewable.
- Mixed repository behavior is temporarily allowed, but each transactional workflow must document which repositories participate in the UoW boundary.
- Adding a repository to a UoW workflow requires checking its save behavior first.

## Verification

- Transaction tests must inject a mid-flow failure and assert rollback of all participating changes.
- Review notes must identify any repository save behavior changed for the UoW path.
