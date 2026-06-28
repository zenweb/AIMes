# 2026-06-15 API host port 5002 follow-up next actions

## Done
- Current Docker/API host guidance is aligned to `localhost:5002`.
- Remaining actionable staging review commands now use `AIMES_LIVE_API_BASE_URL=http://localhost:5002`.
- Current quick-start, pre-launch checklist, and generated marketing copy now point operators at `http://localhost:5002`.

## Next
- When running real browser staging evidence, use `http://localhost:5002` for the API base URL unless a different host port is explicitly configured.
- Do not rewrite old evidence reports only to change historical `localhost:5000` text.
- Keep API host and container listener aligned on `5002` unless there is a separate container networking requirement.
