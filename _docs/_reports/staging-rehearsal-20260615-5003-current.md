# PostgreSQL/Staging Rehearsal Evidence

- Started at: 2026-06-15T07:14:14.9764790+08:00
- ASPNETCORE_ENVIRONMENT: Production
- ConnectionStrings__DefaultConnection: Host=postgresql;Database=mes;Username=postgres;Password=***
- Migration connection string: Host=localhost;Database=mes;Username=postgres;Password=***
- API base URL: http://localhost:5003
- DockerEngineTimeoutSeconds: 30
- DockerPullTimeoutSeconds: 60
- ImagePullMode: Missing

## Docker version

```text
Docker version 29.5.2, build 79eb04c
Docker Compose version v5.1.4
```

Exit code: 0

## Docker engine

```text
docker info timed out after 30 seconds. Check Docker Desktop Linux engine before running staging rehearsal.
```

Exit code: 1

Result: FAIL

Failure: Docker engine failed with exit code 1.

- Finished at: 2026-06-15T07:14:45.4479097+08:00
