# Review - Scheduling API contract coverage

## Scope
- Reviewed `src/frontend/src/api/scheduling.ts`.
- Reviewed `src/frontend/tests/unit/scheduling-api.test.ts`.
- Cross-checked current callers in `ScheduleBoard`, `ParetoCompare`, and `ScheduleAgentWorkbenchPanel`.

## Findings
- No production-code defect was found in this slice.
- The previous evidence gap was coverage and contract drift risk: `scheduling.ts` was largely unexercised in direct API helper tests even though it is a user-critical scheduling boundary.
- The new tests prove endpoint paths, default params, request payloads, and returned `data` values for the existing scheduling API helper surface.

## Decision
- Used API contract tests instead of changing implementation.
- Kept helper functions thin and aligned with the existing `http` wrapper convention.
- Did not add browser coverage because this slice does not change rendered UI behavior; related scheduling UI callers were covered by unit regressions, and the prior schedule Chromium evidence remains current for the latest UI behavior change.

## Residual Risk
- These tests mock the local `http` wrapper and do not prove backend schema compatibility by themselves.
- The known coverage warning remains: `--localstorage-file was provided without a valid path`.
