# 2026-07-05 Hosted CI cc45df7 Release Gate Refresh Changelog

## Added

- Added `_docs/_reports/hosted-ci-20260705-v1-cc45df7-pass.md`.
- Added `_docs/_reports/release-gate-audit-20260705-current-hosted-ci-cc45df7-deferred-gray.md`.

## Changed

- Updated `_docs/_plan/20260514-cc-remediation-plan.md` to cite the current GitHub `V1` head `cc45df7cfa3f343ceb2036722215aa04f83b40aa` and the refreshed deferred-gray release gate packet.

## Verified

- GitHub Actions CI run `28719432617`: `success` on branch `V1`, head `cc45df7cfa3f343ceb2036722215aa04f83b40aa`.
- GitHub Actions Agent Evaluation run `28719432629`: `success` on branch `V1`, same head.
- `scripts/run-hosted-ci-evidence.ps1`: generated `Result: PASS`.
- `scripts/run-release-gate-audit.ps1 -DeferGrayObservation`: generated `Result: PASS_WITH_DEFERRED_GRAY_OBSERVATION`.

## Boundary

- The strict final v1.0.0 gate still requires real gray observation monitoring evidence proving `P0=0` and `P1=0`.
- Local `git ls-remote` continued to hit HTTPS transport reset, but `gh run` and `gh run view` succeeded and are the authoritative hosted run evidence in this packet.
