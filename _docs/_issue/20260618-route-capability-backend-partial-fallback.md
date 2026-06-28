# 2026-06-18 Route Capability Backend Partial Fallback Issue

## Status

Closed for this slice.

## Problem

`readRouteCapabilityValidationBackendFirst()` accepted any non-null backend route capability response. A backend payload containing only `routeCode` and `traceId` could replace a complete local record and hide the actual bottleneck, candidate resource, affected orders, capacity gap, changeover, and audit chain.

## Resolution

Backend route capability evidence is now used only when it passes the complete `isRouteCapabilityValidation` guard. Otherwise the reader falls back to local evidence.

## Verification

- RED targeted test failed before the fix for the expected reason.
- GREEN targeted test passed: `8 passed`.
- Full frontend coverage passed: `111 files / 1065 tests passed`.
- Lint passed.

## Still Open Outside This Issue

- Strict v1.0.0 release readiness is still not complete because gray observation remains deferred.
