# 2026-06-14 Plan - Staging Reschedule Persistence Current

## Success Criteria
- Docker engine and staging dependencies are available.
- EF migrations are up to date.
- API `/live` and `/ready` return HTTP 200.
- Reschedule PATCH writes the expected schedule window.
- PostgreSQL query returns the exact patched window.
- API GET returns the exact patched window.
- Related Scheduling controller/repository integration tests pass.
- Release gate remains passable with gray observation explicitly deferred.

## Execution
1. Inspect existing staging and Scheduling persistence evidence.
2. Reuse the existing staging rehearsal reschedule probe instead of creating duplicate tooling.
3. Run the current rehearsal with `-IncludeRescheduleProbe`.
4. Run focused Scheduling integration regression.
5. Re-run release gate audit with the new staging report and deferred gray observation.
6. Document results and boundaries.

## Outcome
- Criteria met.
- No production code change required.
