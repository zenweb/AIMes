# 2026-06-15 backend baseline and 5003 staging gate review

## Findings

- No backend code regression was found in the tested baseline projects.
- The first Architecture test attempt failed because Unit and Architecture test runs built the shared API project concurrently, locking `rjsmrazor.dswa.cache.json`. A serial Architecture rerun passed, so this is classified as a Windows build-cache contention issue, not an architecture-rule failure.
- PostgreSQL/staging is still not release-ready: Docker CLI version works, but engine commands time out.

## Evidence

- Unit: 444 passed.
- Architecture: 115 passed on serial rerun.
- Integration: 203 passed.
- Evaluation: 2 passed.
- Staging report: `_docs/_reports/staging-rehearsal-20260615-5003-current.md`.
- Release gate report: `_docs/_reports/release-gate-audit-20260615-5003-staging-engine-timeout.md`.

## Release Decision

Do not claim v1.0.0 release gate closure. The current audited status is FAIL because PostgreSQL/staging is not PASS.
