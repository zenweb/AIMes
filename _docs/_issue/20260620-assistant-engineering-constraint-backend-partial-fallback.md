# 2026-06-20 Issue: Assistant Engineering Constraint Backend Partial Fallback

## Issue
`readAssistantEngineeringConstraintPackagesBackendFirst()` trusted backend package records before verifying response shape or engineering constraint package completeness.

## Impact
- A non-array backend payload could surface as `remoteRecords is not iterable`.
- A partial backend record with only identifiers and timestamps could replace a complete local engineering constraint package.
- That would weaken traceability across BOM, ECN, route capability, AI scheduling, quality gate, and OTD evidence.

## Resolution
- Added explicit non-array backend payload handling.
- Reused `isAssistantEngineeringConstraintPackage` to filter backend records before merge.
- Preserved local complete records as fallback when backend records are missing, malformed, or incomplete.

## Evidence
- Targeted and adjacent unit tests passed on 2026-06-20.
