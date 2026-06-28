# 2026-06-21 Employee Offline Demo Phase-One Matrix Link

## Change
- Added Employee offline-demo current evidence to `_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md`.
- Added architecture guard `PhaseOneMatrix_ShouldCiteEmployeeOfflineDemoRealBrowserEvidence`.

## Why
- The Employee offline-demo browser evidence was repeatable, but still isolated from the phase-one/Sprint 0 audit matrix.
- Sprint 0 evidence should make user-visible frontend baseline slices easy to find during review.

## Evidence
- RED: `PhaseOneMatrix_ShouldCiteEmployeeOfflineDemoRealBrowserEvidence` failed because the matrix did not cite `Employee offline-demo backend skip quiet fallback`.
- Matrix update now cites:
  - `scripts/run-employee-offline-demo-evidence.ps1`
  - `_docs/_reports/frontend-real-browser-employee-offline-demo-20260621-current.md`
  - `offline-demo-mode.test.ts`
  - `employee-board.test.ts`
  - `employee.spec.ts`

## Boundary
- This does not claim hosted CI, staging, or gray-observation completion.
- It links one focused Employee offline-demo evidence slice into phase-one audit evidence.
