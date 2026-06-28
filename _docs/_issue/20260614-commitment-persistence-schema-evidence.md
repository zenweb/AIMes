# 2026-06-14 Issue - Commitment Persistence Schema Evidence

## Issue
Full OTD KPI and outsourcing commitment package JSON could exceed the `agent_evidence_links.evidence_summary` 1000-character limit in real PostgreSQL.

## Impact
- Commitment upsert endpoints could return HTTP 500 in staging even though contract tests passed.
- Report-generated commitment packages would fail to persist as AgentEvidenceLink and AuditLog evidence, weakening the Report -> Chat/Schedule -> Audit chain.

## Resolution
- Removed the `HasMaxLength(1000)` limit from `AgentEvidenceLink.EvidenceSummary`.
- Added migration `20260613195241_ExpandAgentEvidenceSummaryText` to alter the column to `text`.
- Added staging commitment persistence probe to verify API latest readback and PostgreSQL evidence/audit rows.

## Status
- Closed for current staging commitment persistence.
- Release gate remains `PASS_WITH_DEFERRED_GRAY_OBSERVATION`, not strict final PASS.
