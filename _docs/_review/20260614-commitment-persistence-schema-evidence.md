# 2026-06-14 Review - Commitment Persistence Schema Evidence

## Scope
- Reviewed OTD KPI commitment and outsourcing commitment backend persistence under real PostgreSQL.
- Focused on API upsert, latest readback, AgentEvidenceLink persistence, AuditLog persistence, and release gate consistency.

## Findings
- Found and fixed one real staging defect: `agent_evidence_links.evidence_summary` was too short for complete commitment package JSON.
- The schema now matches the evidence-envelope use case by storing summaries as `text`.
- The commitment staging probe passes after migration, proving current API and database behavior.

## Verification
- Staging commitment probe: PASS.
- Focused commitment integration tests: 2/2 passed.
- Scheduling controller/repository regression: 66/66 passed.
- Release gate with deferred gray observation: PASS_WITH_DEFERRED_GRAY_OBSERVATION.

## Residual Risk
- This validates the backend persistence/audit layer for commitment packages, not every frontend rendering state.
- Strict final-release gray observation is still deferred by owner instruction.
