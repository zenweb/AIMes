# PostgreSQL/Staging Rehearsal Evidence

- Started at: 2026-06-06T10:01:13.1672977+08:00
- ASPNETCORE_ENVIRONMENT: Production
- ConnectionStrings__DefaultConnection: Host=postgresql;Database=mes;Username=postgres;Password=***
- Migration connection string: Host=localhost;Database=mes;Username=postgres;Password=***
- API base URL: http://localhost:5000
- DockerPullTimeoutSeconds: 5
- ImagePullMode: Never

## Docker version

```text
Docker version 29.5.2, build 79eb04c
Docker Compose version v5.1.4
```

Exit code: 0

## Docker registry/proxy diagnostics

```text
Registry mirrors:
[]
HTTP proxy:
http.docker.internal:3128
HTTPS proxy:
http.docker.internal:3128
Local images:
```

Exit code: 0

## Resolve external dependency images

```text
Error response from daemon: No such image: postgres:16-alpine
```

Exit code: 1

Result: FAIL

Failure: Resolve external dependency images failed with exit code 1.

- Finished at: 2026-06-06T10:01:19.3727890+08:00
