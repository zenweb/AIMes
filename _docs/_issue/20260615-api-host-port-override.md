# 2026-06-15 API Host Port Override Issue

## Problem

The project should not keep using backend host port `5000`. The preferred default is `5002`, but the current workstation can have `5002` occupied by another local service.

## Impact

Without an explicit override path, a blocked `5002` can push manual runs back toward stale `5000` habits or require ad hoc Compose edits.

## Resolution

Docker Compose now uses `${AIMES_API_HOST_PORT:-5002}:5002`, keeping `5002` as the default while allowing a declared non-5000 host override such as `5003`.
