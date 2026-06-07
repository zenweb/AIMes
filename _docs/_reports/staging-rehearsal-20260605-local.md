# PostgreSQL/Staging Rehearsal Evidence

- Started at: 2026-06-05T23:04:39.5569679+08:00
- ASPNETCORE_ENVIRONMENT: Production
- ConnectionStrings__DefaultConnection: Host=postgresql;Database=mes;Username=postgres;Password=***
- Migration connection string: Host=localhost;Database=mes;Username=postgres;Password=***
- API base URL: http://localhost:5000

## Docker version

```text
Docker version 29.5.2, build 79eb04c
Docker Compose version v5.1.4
```

Exit code: 0

## Pull external dependency images

```text
docker pull postgres:16-alpine timed out after 90 seconds. Check Docker Desktop proxy or pre-pull the image.
```

Exit code: 1

Result: FAIL

Failure: Pull external dependency images failed with exit code 1.

- Finished at: 2026-06-05T23:05:01.0981411+08:00
