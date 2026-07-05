# 2026-07-05 Gray Observation Evidence Reference Gate Changelog

## Changed

- Hardened `scripts/run-gray-observation.ps1` so repo-local gray evidence references under `_docs/` or `output/` must exist.
- Hardened `scripts/run-release-gate-audit.ps1` so strict gray aggregation rejects PASS packets that cite missing repo-local evidence files.
- Added architecture-test guard tokens for gray evidence reference validation.
- Added `_docs/_review/20260705-gray-observation-evidence-reference-gate.md`.

## Verified

- Architecture focused filter: `15 passed / 0 failed / 0 skipped`.
- Gray script missing-reference PASS sample: `EXPECTED_FAIL`.
- Gray script existing-reference PASS sample: `PASS`.
- Release gate missing-reference gray PASS sample: `EXPECTED_FAIL`.
- Release gate existing-reference gray PASS sample: `PASS`.

## Boundary

- No business code changed.
- Strict v1.0.0 remains blocked until real gray monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
