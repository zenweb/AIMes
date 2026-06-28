# 2026-06-15 Plan: API host port 5002 follow-up

## Assumptions
- The requested change is about the host backend port, not the container-internal ASP.NET listener.
- Docker Compose should map host `5002` to container `5002`.

## Steps
1. Search runtime config, scripts, tests, and current operator docs for host `localhost:5000`.
2. Update actionable command examples to `localhost:5002`.
3. Update current checklist/quick-start/marketing copy that operators may follow for local startup.
4. Verify no current runtime references still force host `5000`.
5. Verify Docker Compose resolves to host `5002` and target `5002`.

## Stop condition
- New local backend/browser evidence should default to `5002`; any remaining `5000` should be historical evidence text or unrelated numeric data.
