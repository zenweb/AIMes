# 2026-06-19 Issue: Offline Demo Routing Quiet Fallback

## Problem
Real browser verification showed `/scheduling/routing?offlineDemo=1` could display technical skip messages for:

- `/api/v1/routing`
- `/api/v1/scheduling/route-capability-validation/latest`

## Root Cause
The routing board catch blocks treated offline demo transport skips like real backend failures and copied the technical skip messages into user-facing alerts.

## Resolution
- Imported `isOfflineDemoError`.
- In `loadRoutes()`, local demo routes are still populated, but `OfflineDemoApiError` does not set the route-list failure alert.
- In `applyStoredRouteCapabilityValidation()`, `OfflineDemoApiError` keeps capability validation open without setting the capability-history failure alert.
- Ordinary backend failures still render the existing fail-loud alerts.

## Status
Resolved for routing list startup loading and route-capability history startup loading.
