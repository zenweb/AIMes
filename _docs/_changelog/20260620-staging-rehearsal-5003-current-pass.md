# 2026-06-20 Staging Rehearsal 5003 Current PASS

## Change

- Started Docker Desktop from the current shell after the Docker API pipe was unavailable.
- Re-ran PostgreSQL/staging rehearsal on port `5003`.
- Included the reschedule and commitment PostgreSQL persistence probes.
- Refreshed the release-gate audit to point at the new 2026-06-20 staging packet.

## Evidence

- Staging command:
  - `scripts/run-staging-rehearsal.ps1`
  - `-ReportPath _docs/_reports/staging-rehearsal-20260620-5003-current.md`
  - `-ApiBaseUrl http://localhost:5003`
  - `-ImagePullMode Missing`
  - `-IncludeRescheduleProbe`
  - `-IncludeCommitmentProbe`
- Staging result: `PASS`
- Release gate report:
  - `_docs/_reports/release-gate-audit-20260620-current-staging-refreshed-deferred-gray.md`
  - Result: `PASS_WITH_DEFERRED_GRAY_OBSERVATION`

## Verified

- Docker engine: exit code 0.
- External dependencies: exit code 0.
- EF migrations: exit code 0, database already up to date.
- API: `aimes-api` running on `0.0.0.0:5003->5003/tcp`.
- `/live`: HTTP 200.
- `/ready`: HTTP 200.
- Reschedule probe: PATCH, PostgreSQL stored window, and GET read model matched.
- Commitment probe: OTD and outsourcing evidence rows plus audit rows persisted in PostgreSQL.

## Boundary

- This closes the current Docker/staging refresh gap.
- Strict final v1.0.0 still needs non-deferred gray observation.
- Hosted CI still covers committed HEAD only until current worktree changes are staged, pushed, and CI reruns.
