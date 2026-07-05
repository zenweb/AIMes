# 2026-07-05 Gray incident review content gate

- Hardened `scripts/run-gray-incident-review.ps1` so `IncidentQueryEvidence` must point to repo-local text evidence with gray release id, observation window dates, monitoring context, `P0=0`, and `P1=0`.
- Added architecture guard tokens for `Test-IncidentQueryEvidenceContentPass`.
- Added review note `_docs/_review/20260705-gray-incident-review-content-gate.md`.

Strict v1.0.0 remains blocked until real production monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
