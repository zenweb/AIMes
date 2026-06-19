# 2026-06-20 Issue: Employee page trapped in offline demo mode

## Problem

The employee page could show local fallback data with:

`Offline demo mode skipped backend request: /api/v1/employee`

or `员工列表加载失败`, even after Docker and the API were healthy.

## Cause

- Ordinary local preview login could choose demo login automatically and persist `aimes_offline_demo=true`.
- The current `4173` built frontend server did not proxy `/api/*`, so login requests could receive the SPA fallback instead of the backend response.
- The active Docker staging database did not contain the documented `admin` account before this slice.

## Resolution

- Ordinary preview login is now backend-first.
- Explicit `?offlineDemo=1` still keeps offline demo login available.
- The current local database has `admin / admin123`.
- The current local 4173 entry forwards API requests to backend port `5003`.
