# 2026-06-15 Changelog: API host port 5002 follow-up

## Changed
- Updated remaining actionable live staging review/todo command examples from host `localhost:5000` to `localhost:5002`.
- Updated the pre-launch checklist and V1 marketing quick-start copy so new operator-facing instructions use host `localhost:5002`.
- Changed the API container listener from `5000` to `5002`; Docker Compose now publishes API as `5002:5002`.

## Verification
- `rg -n "localhost:5000|127\\.0\\.0\\.1:5000|5000:5000" -S scripts src docker-compose.yml README.md _docs\\quickstart.md _docs\\SOP.md _docs\\troubleshooting.md --glob "!src/frontend/node_modules/**" --glob "!src/frontend/dist/**" --glob "!src/backend/MES.Api/wwwroot/**"` returned no current runtime matches.
- `rg -n "localhost:5000|127\\.0\\.0\\.1:5000|5000:5000" README.md _docs\\SOP.md _docs\\quickstart.md _docs\\_marketing _docs\\_plan\\20260514-pre-launch-checklist.md docker-compose.yml src\\frontend src\\backend\\MES.Api\\Program.cs` returned no actionable host-port matches.
- `docker compose config` reports API published port `5002` and target port `5002`.
