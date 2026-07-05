# 2026-07-05 Gray Observation Evidence Request Current CI Anchor Changelog

## Changed

- Updated `_docs/_reports/gray-observation-monitoring-evidence-request-20260705.md` so the strict release-gate rerun example uses `_docs/_reports/hosted-ci-20260705-v1-ecdd6d05-pass.md`.
- Added the current GitHub `V1` tip context after release-gate sync commit `3c349dfdd76f8c38bc6aacafcab66d8739d369d1`.
- Documented the non-recursive evidence boundary: the strict blocker is missing gray P0/P1 monitoring evidence, not hosted CI availability.

## Boundary

- This change does not claim gray observation PASS.
- Strict final v1.0.0 still requires real monitoring or signed incident-review evidence proving `P0=0` and `P1=0` for the gray observation window.
