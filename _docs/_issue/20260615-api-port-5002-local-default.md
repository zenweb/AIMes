# 2026-06-15 Issue: local API port split

## Problem

Local `dotnet run` and Nuxt proxy defaults still used `5147`, while the current AIMes Docker/operator path uses `5002`. That split made it easy for future verification work to target a stale or unexpected backend endpoint.

## Resolution

Unified the current local backend and frontend proxy defaults on `http://localhost:5002`.
