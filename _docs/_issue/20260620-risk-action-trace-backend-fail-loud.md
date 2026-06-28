# 2026-06-20 Issue: Risk Action Trace Backend Read Could Hide Audit Refresh Failures

## Problem

`queryRiskActionTraces` returned `[]` for backend errors, and `readRiskActionTracesBackendFirst` caught all errors before falling back to local storage. This was acceptable for demo fallback reads but too weak for audit refresh paths that need to detect backend evidence outages.

The sync layer also assumed the backend returned an array before calling `.filter`, so a non-array backend envelope did not have a clear domain error.

## Impact

- Audit/report refresh could display local trace evidence while hiding backend unavailability.
- Malformed backend risk action trace payloads could be interpreted as ordinary fallback conditions.

## Resolution

- Added optional `failLoud` propagation to `queryRiskActionTraces`.
- Added optional `failLoud` propagation and explicit array-shape validation to `readRiskActionTracesBackendFirst`.
- Added RED/GREEN tests for backend failure and non-array payload behavior.
