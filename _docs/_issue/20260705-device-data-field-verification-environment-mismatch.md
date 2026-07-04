# 2026-07-05 Device Data Field Verification Environment Mismatch

## Severity

`MEDIUM`

## Status

`BLOCKED_BY_MISSING_TARGET_RUNTIME`

## Summary

The requested deployment verification targets reference `DeviceDataIocTask`, `ShouldQuarantine`, `SubmitLockHandle`, and `usemark=9`, but the active `C:\AIWorks\AIMes\v1` repository and Docker runtime do not contain those symbols, tables, or log evidence.

## Impact

The field verification cannot be honestly marked complete from the current AIMes runtime. The currently running API on port `5002` can be validated for AIMes scheduling/quality/admin surfaces, but it cannot prove device-data queue quarantine behavior that is absent from this codebase and schema.

## Evidence

- Code scan in `C:\AIWorks\AIMes\v1\src`: no matching symbols.
- API log scan: no `DeviceDataIocTask`, `usemark`, or quarantine evidence.
- PostgreSQL `mes` schema: no device/ioc queue table and no `usemark`/quarantine columns.
- Docker status: `aimes-api` is healthy on `5002->5003`, so this is not a Docker availability problem.

## Required Resolution

Route verification to the correct service/repository/environment that owns the device-data ingestion queue.

Until then, keep this as a fail-loud boundary rather than retrying unrelated AIMes probes.
