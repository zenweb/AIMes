# 2026-06-20 Todo: Anomaly Dispatch Backend Fail Loud Next Actions

- [x] Once Docker Engine is reachable from the current shell, run live API/browser readback for `/api/v1/scheduling/anomaly-dispatch-records` on port `5003`.
  - 2026-07-05 update: Completed against the running live stack on `http://127.0.0.1:5002` because the existing `v1` Docker API maps host `5002` to container `5003`, matching the current no-5000 port constraint. Evidence: `_docs/_review/20260705-anomaly-dispatch-live-readback.md`.
- [ ] Continue the backend-first evidence audit with the next user-critical path that still lacks opt-in `failLoud`.
- [ ] Keep filtered adjacent test reports explicit about skipped counts.
- [ ] Preserve ordinary startup/demo fallback behavior unless the caller explicitly opts into `failLoud`.
