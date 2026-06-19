# 2026-06-20 Plan - Staging Rehearsal 5003 Current PASS

## Objective

Refresh the current PostgreSQL/staging evidence on port 5003 and feed it into the release gate audit.

## Steps

1. Restore Docker Desktop API availability in the current shell.
2. Run staging rehearsal with missing-image pull mode.
3. Include reschedule and commitment persistence probes.
4. Verify health endpoints and PostgreSQL readback.
5. Rerun release gate audit with the refreshed staging packet.

## Outcome

- Completed.
- Docker API became reachable after starting Docker Desktop.
- Staging rehearsal passed.
- Release gate audit now references `_docs/_reports/staging-rehearsal-20260620-5003-current.md`.

## Next

- Decide which dirty worktree changes belong in the next pushed head.
- Push that head and refresh hosted CI evidence.
- Keep gray observation as the explicit remaining strict release wall-clock gate.
