# Plan: staging Docker preflight and gate pass

## Goal

Close the current PostgreSQL/staging evidence blocker without using backend port `5000`.

## Steps

1. Confirm Docker daemon state with direct `docker info`.
2. Reproduce the staging script failure and inspect its captured report.
3. Fix only the Docker preflight false-negative path.
4. Add a regression architecture test for the preflight contract.
5. Run staging rehearsal on `http://localhost:5003` with PostgreSQL persistence probes.
6. Run release gate audit with gray observation explicitly deferred by owner.

## Result

- PostgreSQL/staging evidence: PASS.
- Release gate audit: `PASS_WITH_DEFERRED_GRAY_OBSERVATION`.
- Remaining boundary: strict final v1.0.0 still needs real gray observation if the owner later requires the original 14-day gate.
