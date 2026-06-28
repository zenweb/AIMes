# 2026-06-14 Plan - Commitment Persistence Schema Evidence

## Success Criteria
- OTD KPI commitment upsert succeeds against current staging API.
- Outsourcing commitment upsert succeeds against current staging API.
- Latest readback returns the probe IDs.
- PostgreSQL contains one AgentEvidenceLink row for each commitment package.
- PostgreSQL contains one AuditLog row for each commitment package.
- Focused backend commitment tests pass.
- Release gate audit remains passable with gray observation deferred.

## Execution
1. Inspect backend endpoints, DTOs, services, and integration tests for commitment packages.
2. Add a current-state staging commitment persistence probe.
3. Reproduce the staging HTTP 500 and identify the PostgreSQL evidence summary length limit.
4. Expand `agent_evidence_links.evidence_summary` to `text` via EF migration.
5. Re-run staging probe, focused tests, and release gate audit.
6. Document the fix, evidence, and boundaries.

## Outcome
- Criteria met.
- Production code change is limited to persistence schema/configuration plus staging probe coverage.
