# 2026-06-15 backend baseline and 5003 staging gate issue

## Issue

The backend code baseline is green, but the release gate remains blocked by PostgreSQL/staging because Docker engine commands time out.

## Observed Behavior

- `docker version` returns Docker CLI and Compose versions.
- `docker info` timed out in the staging rehearsal after 30 seconds.
- A separate direct `docker info` probe timed out after 60 seconds.
- A separate `docker ps` probe timed out after 20 seconds.

## Impact

The project cannot produce fresh PostgreSQL/staging PASS evidence, so the v1.0.0 release gate cannot be closed even though backend unit, architecture, integration, and evaluation tests pass.

## Non-Issue

The transient Architecture failure from the first attempt was caused by concurrent build cache access and passed on serial rerun.
