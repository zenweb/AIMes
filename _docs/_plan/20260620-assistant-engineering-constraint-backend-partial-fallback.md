# 2026-06-20 Plan: Assistant Engineering Constraint Backend Partial Fallback

## Goal
Prevent malformed or incomplete backend assistant engineering constraint packages from replacing complete local engineering constraint evidence.

## Success Criteria
- Non-array backend engineering constraint package payload fails loud with a readable Chinese audit error when requested.
- Incomplete backend engineering constraint records are ignored.
- Complete local engineering constraint packages remain available when backend evidence is missing or incomplete.
- Adjacent scheduling, chat, audit replay, and engineering constraint panel behavior remains stable under targeted tests.

## Execution
1. Add RED tests for non-array backend payload and partial backend engineering constraint package evidence.
2. Update `readAssistantEngineeringConstraintPackagesBackendFirst()` to validate array shape and filter records through `isAssistantEngineeringConstraintPackage`.
3. Run target and adjacent unit tests.
4. Run targeted lint and diff whitespace checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
