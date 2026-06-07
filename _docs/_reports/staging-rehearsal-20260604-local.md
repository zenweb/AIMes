# PostgreSQL/Staging Rehearsal Evidence

- Started at: 2026-06-04T23:32:52.8739164+08:00
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

## Start external dependencies

```text
 Image postgres:16-alpine Pulling 
 Image rabbitmq:4-management-alpine Pulling 
 Image redis:7-alpine Pulling 
 Image qdrant/qdrant:latest Pulling 
 Image redis:7-alpine Error failed to resolve reference "docker.io/library/redis:7-alpine": failed to do request: Head "https://registry-1.docker.io/v2/library/redis/manifests/7-alpine": dialing registry-1.docker.io:443 container via direct connection because Docker Desktop has no HTTPS proxy: connecting to registry-1.docker.io:443: dial tcp 199.59.148.246:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
 Image qdrant/qdrant:latest Interrupted 
 Image postgres:16-alpine Interrupted 
 Image rabbitmq:4-management-alpine Interrupted 
Error response from daemon: failed to resolve reference "docker.io/library/redis:7-alpine": failed to do request: Head "https://registry-1.docker.io/v2/library/redis/manifests/7-alpine": dialing registry-1.docker.io:443 container via direct connection because Docker Desktop has no HTTPS proxy: connecting to registry-1.docker.io:443: dial tcp 199.59.148.246:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

Exit code: 1

Result: FAIL

Failure: Start external dependencies failed with exit code 1.

- Finished at: 2026-06-04T23:33:14.7318737+08:00
