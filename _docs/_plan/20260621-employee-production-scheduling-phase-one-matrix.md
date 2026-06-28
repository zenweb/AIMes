# Plan: Employee Production Scheduling Phase-One Matrix Link

## Goal
Make the Employee -> Production -> Scheduling backend evidence chain discoverable from the phase-one Sprint 0 matrix.

## Steps
1. Refresh `scripts/run-employee-production-scheduling-evidence.ps1`.
2. Add a RED architecture guard requiring phase-one matrix citation.
3. Add a Sprint 0 matrix row with source, report, test groups, and release-boundary wording.
4. Run the focused matrix guard.
5. Re-run the focused evidence script if the matrix changes again.

## Status
- Completed on 2026-06-21.

## Stop Condition
- Matrix guard passes and `_docs/_reports/employee-production-scheduling-evidence-20260621-current.md` remains `Result: PASS`.

## Verification
- Evidence script refresh: PASS.
- Focused matrix guard: PASS, 1/1.
