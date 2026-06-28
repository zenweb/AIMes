# 2026-06-15 API Host Port Override Next Actions

- For new local backend runs, use default `http://localhost:5002` only when the port is free.
- If `5002` is occupied, set `AIMES_API_HOST_PORT=5003` for Docker Compose and set frontend/API test targets to `http://localhost:5003`.
- Do not use host `localhost:5000` for new browser, staging, or operator evidence.
- Continue the ScheduleBoard boutique-quality evidence slice after the port guard is verified.
