# 2026-06-20 Issue: Anomaly Dispatch Backend Read Could Hide Audit Refresh Failures

## Problem

`queryAnomalyDispatchRecords` returned `[]` for backend errors, and `readAnomalyDispatchRecordsBackendFirst` caught all errors before falling back to local storage. That behavior is useful for ordinary startup/demo resilience but too weak for audit refresh flows that need backend evidence outages to be visible.

The sync layer also assumed the backend returned an array before filtering dispatch records, so malformed backend envelopes lacked a clear domain error.

## Impact

- Anomaly/risk/schedule/report surfaces could reuse local dispatch evidence while hiding backend unavailability.
- Malformed backend dispatch payloads could be treated as empty evidence instead of failing an audit refresh.

## Resolution

- Added optional `failLoud` propagation to `queryAnomalyDispatchRecords`.
- Added optional `failLoud` propagation and array-shape validation to `readAnomalyDispatchRecordsBackendFirst`.
- Added RED/GREEN tests for backend failure and non-array payload behavior.
