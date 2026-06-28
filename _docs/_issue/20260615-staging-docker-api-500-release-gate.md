# 2026-06-15 Issue: Docker Desktop Linux engine API 500 blocks staging

## Problem

The current PostgreSQL/staging rehearsal cannot start Docker Compose dependencies because Docker Desktop Linux engine API calls fail.

Observed failures:

- `docker info` timed out after 30 seconds with Docker Desktop LinuxEngine API 500.
- `docker ps` timed out after 30 seconds with Docker Desktop LinuxEngine API 500.
- `run-staging-rehearsal.ps1` failed at the Docker engine check.

## Impact

The PostgreSQL/staging release gate remains FAIL. Hosted CI, attack-chain verification, and security signoff are PASS, and gray observation is owner-deferred, but v1.0.0 final release readiness cannot be claimed while staging is red.

## Current Evidence

- Staging rehearsal: `_docs/_reports/staging-rehearsal-20260615-5003-docker-api-500.md`.
- Release gate audit: `_docs/_reports/release-gate-audit-20260615-5003-docker-api-500.md`.

## Scope

This is an environment blocker for staging evidence. No application code was changed in this check.
