# Issue: Employee Offline Demo Phase-One Matrix Link

## Problem
Employee offline-demo backend-skip handling had repeatable evidence, but the phase-one Sprint 0 matrix did not cite it.

## Impact
- Reviewers could see a standalone report without knowing it belongs to Sprint 0 baseline hardening.
- Future matrix audits could miss regressions in the Employee offline-demo entry.

## Resolution
- Added a Sprint 0 matrix row: `Employee offline-demo backend skip quiet fallback`.
- Added `PhaseOneMatrix_ShouldCiteEmployeeOfflineDemoRealBrowserEvidence`.

## Verification
- RED guard failure captured before the matrix update.
- GREEN guard passed after the matrix update.
- Employee offline-demo current report regenerated with `Result: PASS`.
