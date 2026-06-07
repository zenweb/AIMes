# PostgreSQL/Staging Rehearsal Evidence

- Started at: 2026-06-07T16:42:30.8766909+08:00
- ASPNETCORE_ENVIRONMENT: Production
- ConnectionStrings__DefaultConnection: Host=postgresql;Database=mes;Username=postgres;Password=***
- Migration connection string: Host=localhost;Database=mes;Username=postgres;Password=***
- API base URL: http://localhost:5000
- DockerPullTimeoutSeconds: 45
- ImagePullMode: Missing

## Docker version

```text
Docker version 29.5.2, build 79eb04c
Docker Compose version v5.1.4
```

Exit code: 0

## Docker engine

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine; check if the path is correct and if the daemon is running: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

Exit code: 1

Result: FAIL

Failure: Docker engine failed with exit code 1.

- Finished at: 2026-06-07T16:42:35.9365500+08:00
