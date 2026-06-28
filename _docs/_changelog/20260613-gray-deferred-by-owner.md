# 2026-06-13 Changelog: Gray observation deferred by owner

## Changed

- Added an explicit `-DeferGrayObservation` mode to `scripts/run-release-gate-audit.ps1`.
- The strict release audit still fails when gray observation is only `OBSERVING`.
- The deferred audit now returns `PASS_WITH_DEFERRED_GRAY_OBSERVATION` so follow-up work can continue without pretending the 14-day gate passed.
- Hardened attack-chain evidence reference checks to resolve `_docs/` and `output/` paths from the repository root.

## Evidence

- Strict audit remains blocking: `_docs/_reports/release-gate-audit-20260613-strict-gray-still-blocking.md`.
- Owner-deferred audit: `_docs/_reports/release-gate-audit-20260613-gray-deferred-by-owner.md`.
- Attack-chain reference guard rerun: `_docs/_reports/attack-chain-verification-20260613-reference-guard.md`.

