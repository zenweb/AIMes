# 2026-07-05 Hosted CI 36ff338 Release Gate Refresh Changelog

## Added

- Added `_docs/_reports/hosted-ci-20260705-v1-36ff338-pass.md`.
- Added `_docs/_reports/release-gate-audit-20260705-current-hosted-ci-36ff338-deferred-gray.md`.

## Verified

- GitHub `V1` head: `36ff3388197fb6540221c5cb79373882f26863d1`.
- GitHub Actions CI run `28721692957`: `success` on branch `V1`, head `36ff3388197fb6540221c5cb79373882f26863d1`.
- GitHub Actions Agent Evaluation run `28721692960`: `success` on branch `V1`, same head.
- Current strict gate boundary remains `_docs/_reports/release-gate-audit-20260705-strict-gray-monitoring-missing.md`.

## Boundary

- Current-head hosted CI evidence: `PASS`.
- Deferred-gray release gate packet: `PASS_WITH_DEFERRED_GRAY_OBSERVATION`.
- Strict final v1.0.0 gate still requires real gray observation monitoring evidence proving `P0=0` and `P1=0`.
