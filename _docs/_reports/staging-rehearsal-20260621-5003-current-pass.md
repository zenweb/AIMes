# PostgreSQL/Staging Rehearsal Evidence

- Started at: 2026-06-21T14:21:14.6632984+08:00
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
Client:
 Version:    29.5.2
 Context:    desktop-linux
 Debug Mode: false
 Plugins:
  agent: Docker AI Agent Runner (Docker Inc.)
    Version:  v1.62.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-agent.exe
  ai: Docker AI Agent - Ask Gordon (Docker Inc.)
    Version:  v1.20.2
    Path:     C:\Program Files\Docker\cli-plugins\docker-ai.exe
  buildx: Docker Buildx (Docker Inc.)
    Version:  v0.34.0-desktop.1
    Path:     C:\Program Files\Docker\cli-plugins\docker-buildx.exe
  compose: Docker Compose (Docker Inc.)
    Version:  v5.1.4
    Path:     C:\Program Files\Docker\cli-plugins\docker-compose.exe
  debug: Get a shell into any image or container (Docker Inc.)
    Version:  0.0.47
    Path:     C:\Program Files\Docker\cli-plugins\docker-debug.exe
  desktop: Docker Desktop commands (Docker Inc.)
    Version:  v0.3.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-desktop.exe
  dhi: CLI for managing Docker Hardened Images (Docker Inc.)
    Version:  v0.0.3
    Path:     C:\Program Files\Docker\cli-plugins\docker-dhi.exe
  extension: Manages Docker extensions (Docker Inc.)
    Version:  v0.2.31
    Path:     C:\Program Files\Docker\cli-plugins\docker-extension.exe
  init: Creates Docker-related starter files for your project (Docker Inc.)
    Version:  v1.4.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-init.exe
  mcp: Docker MCP Plugin (Docker Inc.)
    Version:  v0.42.1
    Path:     C:\Program Files\Docker\cli-plugins\docker-mcp.exe
  model: Docker Model Runner (Docker Inc.)
    Version:  v1.2.1
    Path:     C:\Program Files\Docker\cli-plugins\docker-model.exe
  offload: Docker Offload (Docker Inc.)
    Version:  v0.5.94
    Path:     C:\Program Files\Docker\cli-plugins\docker-offload.exe
  pass: Docker Pass Secrets Manager Plugin (beta) (Docker Inc.)
    Version:  v0.0.29
    Path:     C:\Program Files\Docker\cli-plugins\docker-pass.exe
  sandbox: Docker Sandbox (Docker Inc.)
    Version:  v0.12.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-sandbox.exe
  sbom: View the packaged-based Software Bill Of Materials (SBOM) for an image (Anchore Inc.)
    Version:  0.7.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-sbom.exe
  scout: Docker Scout (Docker Inc.)
    Version:  v1.21.0
    Path:     C:\Program Files\Docker\cli-plugins\docker-scout.exe
Server:
 Containers: 6
  Running: 5
  Paused: 0
  Stopped: 1
 Images: 7
 Server Version: 29.5.2
 Storage Driver: overlayfs
  driver-type: io.containerd.snapshotter.v1
 Logging Driver: json-file
 Cgroup Driver: cgroupfs
 Cgroup Version: 2
 Plugins:
  Volume: local
  Network: bridge host ipvlan macvlan null overlay
  Log: awslogs fluentd gcplogs gelf journald json-file local splunk syslog
 CDI spec directories:
  /etc/cdi
  /var/run/cdi
 Discovered Devices:
  cdi: docker.com/gpu=webgpu
 Swarm: inactive
 Runtimes: io.containerd.runc.v2 nvidia runc
 Default Runtime: runc
 Init Binary: docker-init
 containerd version: 193637f7ee8ae5f5aa5248f49e7baa3e6164966e
 runc version: v1.3.5-0-g488fc13e
 init version: de40ad0
 Security Options:
  seccomp
   Profile: builtin
  cgroupns
 Kernel Version: 6.6.87.2-microsoft-standard-WSL2
 Operating System: Docker Desktop
 OSType: linux
 Architecture: x86_64
 CPUs: 16
 Total Memory: 15.51GiB
 Name: docker-desktop
 ID: 18fed00e-6f51-4603-a7e2-0da8db2bb10f
 Docker Root Dir: /var/lib/docker
 Debug Mode: false
 HTTP Proxy: http.docker.internal:3128
 HTTPS Proxy: http.docker.internal:3128
 No Proxy: hubproxy.docker.internal
 Labels:
  com.docker.desktop.address=npipe://\\.\pipe\docker_cli
 Experimental: false
 Insecure Registries:
  hubproxy.docker.internal:5555
  ::1/128
  127.0.0.0/8
 Live Restore Enabled: false
 Firewall Backend: iptables
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
v1-api:latest 7d58a9096e08
qdrant/qdrant:latest 75eab8c4ba42
rabbitmq:4-management-alpine 0c1330bfbaa5
postgres:16-alpine 16bc17c64a57
redis:7-alpine 6ab0b6e73817
mcr.microsoft.com/mssql/server:2022-latest e07b9699a2b7
mcr.microsoft.com/mssql/server:2019-latest 5b89fce40832
```

Exit code: 0

## Resolve external dependency images

```text
Using local image postgres:16-alpine
Using local image redis:7-alpine
Using local image rabbitmq:4-management-alpine
Using local image qdrant/qdrant:latest
```

Exit code: 0

## Start external dependencies

```text
 Container aimes-rabbitmq Running 
 Container aimes-qdrant Running 
 Container aimes-redis Running 
 Container aimes-pg Running 
```

Exit code: 0

## Apply EF migrations

```text
Build started...
Build succeeded.
The Entity Framework tools version '9.0.0' is older than that of the runtime '10.0.9'. Update the tools for the latest features and bug fixes. See https://aka.ms/AAc1fbw for more information.
Acquiring an exclusive lock for migration application. See https://aka.ms/efcore-docs-migrations-lock for more information if this takes too long.
No migrations were applied. The database is already up to date.
Done.
```

Exit code: 0

## Start API

```text
 Container aimes-pg Running 
 Container aimes-redis Running 
 Container aimes-qdrant Running 
 Container aimes-rabbitmq Running 
 Container aimes-api Running 
 Container aimes-pg Waiting 
 Container aimes-redis Waiting 
 Container aimes-rabbitmq Waiting 
 Container aimes-qdrant Waiting 
 Container aimes-qdrant Healthy 
 Container aimes-pg Healthy 
 Container aimes-redis Healthy 
 Container aimes-rabbitmq Healthy 
```

Exit code: 0

## Health /live

HTTP 200

```json
Healthy
```

## Health /ready

HTTP 200

```json
Healthy
```

## Reschedule PostgreSQL persistence probe

```text
INSERT 0 1
DELETE 1
DELETE 1
INSERT 0 1
INSERT 0 1
Probe plan: staging-reschedule-20260612-plan
Probe item: staging-reschedule-20260612-item
PATCH window: 2026-06-12T19:00:00.000Z|2026-06-12T23:00:00.000Z
PostgreSQL stored window: 2026-06-12T19:00:00.000Z|2026-06-12T23:00:00.000Z
GET plan window: 2026-06-12T19:00:00.000Z|2026-06-12T23:00:00.000Z
```

Exit code: 0

## Commitment PostgreSQL persistence probe

```text
INSERT 0 1
DELETE 2
DELETE 2
OTD commitment id: staging-commitment-20260614-otd
Outsourcing commitment id: staging-commitment-20260614-outsourcing
Latest OTD commitment id: staging-commitment-20260614-otd
Latest outsourcing commitment id: staging-commitment-20260614-outsourcing
PostgreSQL OTD evidence rows: 1
PostgreSQL outsourcing evidence rows: 1
PostgreSQL OTD audit rows: 1
PostgreSQL outsourcing audit rows: 1
```

Exit code: 0

Result: PASS

- Finished at: 2026-06-21T14:21:35.6292064+08:00
