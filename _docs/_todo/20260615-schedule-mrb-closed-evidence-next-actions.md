# 2026-06-15 Schedule MRB Closed Evidence Next Actions

- Continue prioritizing existing user-critical paths where new tests add business proof.
- Stop repeatedly polishing ScheduleBoard when the next slice no longer improves meaningful business evidence.
- Reattempt real browser/live staging with `5002` only when free, or use `AIMES_API_HOST_PORT=5003` plus `VITE_API_TARGET=http://localhost:5003`.
- Do not use host `localhost:5000` for new runtime evidence.
- Keep release-gate audit evidence separate from frontend coverage evidence.
