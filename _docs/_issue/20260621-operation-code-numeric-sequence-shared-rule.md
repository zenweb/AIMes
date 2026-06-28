# Issue: Operation Code Numeric Sequence Shared Rule

## Problem
The numeric operation-code ordering rule was duplicated in three production files.

## Impact
Duplicated parsing creates a drift risk across production scan handoff, repository reads, and AI scheduling context snapshots. If one copy changed independently, the same work order could be explained with conflicting operation order evidence.

## Resolution
- Added `OperationCode.NumericSequence`.
- Replaced duplicated private helpers with the shared value object property.

## Verification
- New `OperationCodeTests` prove the shared rule.
- Existing OperationService, OperationRepository, and SchedulingContextProvider focused tests remain green after the extraction.

