# 2026-06-15 Staging Rehearsal Docker Engine Timeout Plan

## Goal

Move from frontend-only evidence toward real staging evidence without using host port `5000`, and fail loud if Docker is not usable.

## Steps

1. Check port state and live staging script requirements.
2. Add bounded Docker engine probing to staging rehearsal.
3. Run a controlled rehearsal with `http://localhost:5003`.
4. Record PASS/FAIL evidence and next action.

## Success Criteria

- The rehearsal command does not hang when Docker engine is unavailable.
- The generated report identifies the exact failure.
- No new runtime guidance points to host `localhost:5000`.
- A future green staging/browser run has a clear rerun command.
