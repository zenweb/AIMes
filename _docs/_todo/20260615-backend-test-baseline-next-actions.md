# 2026-06-15 Backend Test Baseline Next Actions

- [ ] Keep backend test execution sequential for now: use `-m:1` on Unit, Integration, and Evaluation test projects to avoid shared output file locks.
- [ ] When Docker Desktop is confirmed stable for this shell, run a real container smoke against `http://localhost:5002/live` and `http://localhost:5002/ready`.
- [ ] Do not treat benchmark projects as a required baseline gate unless a performance acceptance target is being audited.
- [ ] Continue CC implementation using user-critical existing feature depth as the next routing signal, not broad new scope.

