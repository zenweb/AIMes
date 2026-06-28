# 2026-06-14 Issue - Purchase Supplier Network Decision Lock and Evidence

## Problem
- A supplier network SLA decision could be triggered again after a successful supplier selection.
- The duplicate trigger risked repeated `writeSupplierNetworkDecision` and `upsertOtdEvidenceChainRecord` writes.

## Impact
- Duplicate supplier decision evidence can pollute purchase, schedule review, OTD, and audit replay chains.
- The affected path is user-critical because supplier SLA selection feeds downstream production recovery decisions.

## Resolution
- Disabled the supplier network decision button after a decision exists.
- Added a handler-level guard to stop duplicate decision writes even if the action is invoked directly.
- Preserved the pending-state path verified by the existing regression test.

## Status
- Resolved and verified with unit, focused Chromium e2e, and full frontend unit coverage.
