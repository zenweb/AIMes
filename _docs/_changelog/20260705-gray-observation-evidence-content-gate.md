# 2026-07-05 Gray Observation Evidence Content Gate Changelog

## Changed

- Hardened gray observation repo-local evidence semantics in `scripts/run-gray-observation.ps1`.
- Hardened strict release gate gray aggregation in `scripts/run-release-gate-audit.ps1`.
- Added architecture-test guard tokens for reviewed gray monitoring evidence fields.
- Added `_docs/_review/20260705-gray-observation-evidence-content-gate.md`.

## Verified

- Architecture focused filter: `15 passed / 0 failed / 0 skipped`.
- PowerShell parser: both gray/release gate scripts parse successfully.
- Existing but invalid evidence-request document: `EXPECTED_FAIL`.
- Reviewed monitoring PASS sample: `PASS`.
- Strict release gate with invalid gray evidence reference: `EXPECTED_FAIL`.
- Strict release gate with reviewed gray evidence reference: `PASS`.

## Boundary

- No business code changed.
- Strict v1.0.0 remains blocked until real monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
