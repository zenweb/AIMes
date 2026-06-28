# Issue - Docker Desktop service unavailable for PostgreSQL integration - 2026-06-22

## Status

OPEN.

## Impact

Sprint 0 current-worktree PostgreSQL-dependent integration baseline cannot be completed from this session.

## Evidence

```text
docker version
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine;
The system cannot find the file specified.
```

```text
Get-Service com.docker.service
Name                 Status   StartType
com.docker.service   Stopped  Manual
```

```text
Start-Service com.docker.service
Service 'Docker Desktop Service (com.docker.service)' cannot be started:
Cannot open 'com.docker.service' service on computer '.'.
```

## Required Follow-Up

Start Docker Desktop / Linux Engine from an interactive elevated desktop session, then rerun PostgreSQL-dependent integration tests.
