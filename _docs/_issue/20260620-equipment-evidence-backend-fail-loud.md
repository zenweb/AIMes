# 2026-06-20 Issue: Equipment Evidence Backend Reads Could Hide Audit Refresh Failures

## Problem

Equipment downtime and customer equipment fault latest reads returned `null` for backend errors. The backend-first sync helpers then fell back to local evidence. That behavior is useful for ordinary startup resilience but too weak for audit refresh flows that need backend outages and malformed latest records to be visible.

## Impact

- Report, chat, schedule, and POC governance surfaces could reuse local equipment evidence while hiding backend unavailability.
- Incomplete backend telemetry or downtime records could be treated as ordinary missing evidence.

## Resolution

- Added optional `failLoud` propagation to equipment evidence API reads.
- Added optional `failLoud` propagation and incomplete-record validation to equipment evidence sync helpers.
- Added RED/GREEN tests for backend failure and incomplete latest record behavior.
