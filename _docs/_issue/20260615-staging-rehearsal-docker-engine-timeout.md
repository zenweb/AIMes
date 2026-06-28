# 2026-06-15 Staging Rehearsal Docker Engine Timeout Issue

## Problem

Live staging evidence depends on Docker-backed PostgreSQL and API services. The current environment has Docker CLI available, but Docker engine probing does not complete.

## Evidence

`_docs/_reports/staging-rehearsal-20260615-docker-engine-timeout.md` records:

- Docker version `29.5.2`.
- Docker Compose version `v5.1.4`.
- `docker info timed out after 15 seconds`.

## Impact

PostgreSQL/staging rehearsal and live browser staging cannot be honestly marked PASS while Docker engine is not responding.

## Resolution This Slice

Added timeout protection to the staging rehearsal script so this condition fails loud and leaves an audit report instead of hanging indefinitely.
