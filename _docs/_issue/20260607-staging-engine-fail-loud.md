# Issue: Staging rehearsal blocked by Docker engine

## Symptom

`run-staging-rehearsal.ps1` cannot proceed past Docker preflight.

## Evidence

`docker --version` and `docker compose version` succeed, but `docker info` fails:

`failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`

## Impact

The PostgreSQL/staging release gate cannot produce real migrations, dependency startup, API startup, `/live`, or `/ready` evidence in the current environment.

## Status

Blocked by local Docker Desktop Linux engine availability, not by application code.

