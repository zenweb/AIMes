# 2026-06-14 Todo - Staging Reschedule Persistence Current

## Done
- Ran current PostgreSQL/staging rehearsal with reschedule persistence probe.
- Confirmed `/live` and `/ready` are HTTP 200.
- Confirmed PATCH, PostgreSQL stored window, and API GET readback all match.
- Re-ran Scheduling controller/repository integration tests.
- Re-ran release gate audit with current staging evidence and gray observation deferred.

## Next Actions
- Continue boutique hardening on existing core flows.
- Candidate next slice: direct backend/staging evidence for OTD KPI commitment or outsourcing commitment endpoints if they are persisted server-side; otherwise use coverage-increment routing to pick the next low-coverage user-critical surface.
- Keep release wording precise: current gate is `PASS_WITH_DEFERRED_GRAY_OBSERVATION`, not strict final PASS.
