# 2026-06-14 Todo - Commitment Persistence Schema Evidence

## Done
- Identified the real PostgreSQL schema limit behind the commitment persistence 500.
- Added migration `20260613195241_ExpandAgentEvidenceSummaryText`.
- Added and ran `-IncludeCommitmentProbe` in staging rehearsal.
- Verified OTD KPI and outsourcing commitment evidence/audit rows in PostgreSQL.
- Re-ran focused backend tests and release gate audit.

## Next Actions
- Continue boutique hardening with the next existing user-critical evidence chain.
- Candidate next slice: run a full frontend e2e subset after backend schema change, or use coverage-increment routing to pick the next low-coverage production component.
- Keep gray observation wording precise as owner-deferred/skipped.
