# 2026-06-20 Plan: Assistant Recovery Package Backend Partial Fallback

## Goal
Prevent backend partial or malformed assistant recovery package evidence from replacing complete local execution package records.

## Success Criteria
- Non-array backend recovery package payload fails loud with a readable Chinese audit error when requested.
- Incomplete backend recovery package records are ignored.
- Complete local recovery package evidence remains available when backend evidence is missing or incomplete.
- Scheduling, purchase, and chat recovery package flows keep their existing behavior.

## Execution
1. Add RED tests for non-array backend payload and partial backend package evidence.
2. Update `readAssistantRecoveryPackagesBackendFirst()` to validate array shape and filter records through `isAssistantRecoveryPackage`.
3. Run target and adjacent unit tests.
4. Run targeted lint and diff whitespace checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall v1.0.0 remediation goal complete.
