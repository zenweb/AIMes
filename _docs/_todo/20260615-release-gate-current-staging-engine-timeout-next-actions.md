# 2026-06-15 Release Gate Current Staging Engine Timeout Next Actions

- Fix Docker Desktop Linux engine responsiveness so `docker info` returns promptly.
- Re-run staging rehearsal with `-ApiBaseUrl http://localhost:5003` while `5002` remains occupied.
- After staging rehearsal PASS, rerun release gate audit with the new staging PASS report.
- Then run live browser staging against the same non-5000 API URL.
- Do not use host `localhost:5000` for new staging or browser evidence.
