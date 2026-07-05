# 2026-07-05 Gray aggregate incident evidence content gate

- Hardened `scripts/run-gray-observation.ps1` so reviewed gray evidence packets must include validated `IncidentQueryEvidence` content.
- Hardened `scripts/run-release-gate-audit.ps1` with the same aggregate gray evidence content check.
- Extended architecture guards to require `Test-IncidentQueryEvidenceContentPass` and P0/P1 monitoring transcript tokens in both aggregate scripts.

Strict v1.0.0 remains blocked until real production monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
