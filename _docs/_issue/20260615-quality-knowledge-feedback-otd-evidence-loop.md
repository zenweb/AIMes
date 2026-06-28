# 2026-06-15 Quality Knowledge Feedback OTD Evidence Loop Issue

## Issue

The accepted quality recommendation path was not directly pinned as a full evidence loop in the quality knowledge sync suite.

## Impact

A regression could persist recommendation feedback but miss one of the OTD evidence records, weakening auditability for:

- field adoption feedback
- next-training-set candidate creation
- traceability from recommendation to continuous learning

## Resolution

Added a focused test proving the accepted recommendation path writes the local feedback record and both OTD evidence records.

## Verification

Full frontend unit coverage passed: 111 files / 1000 tests.
