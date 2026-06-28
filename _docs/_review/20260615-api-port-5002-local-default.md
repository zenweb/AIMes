# 2026-06-15 Review: API port 5002 local default

## Findings

- Local development had a separate HTTP default (`5147`) while Docker/operator docs used `5002`, which increased the chance of using the wrong backend endpoint during browser evidence collection.
- The change is configuration-only and keeps the API host port away from `5000`.

## Risk

- Running Docker Compose API and local `dotnet run` at the same time will now contend for host port `5002`; use one backend instance at a time, or override one explicitly.
