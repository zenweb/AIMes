# 2026-07-05 Gray evidence repo-local required

- Hardened `scripts/run-gray-observation.ps1` so strict PASS evidence must include a repo-local reviewed monitoring or incident-review packet.
- Hardened `scripts/run-release-gate-audit.ps1` with the same external-only evidence rejection.
- Added architecture guard tokens for the zero-reference rejection path.

Strict v1.0.0 remains blocked until real production monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
