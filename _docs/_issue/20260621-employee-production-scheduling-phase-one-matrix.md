# Issue: Employee Production Scheduling Phase-One Matrix Link

## Problem
The Employee -> Production -> Scheduling backend evidence chain had a repeatable script/report, but the phase-one matrix did not cite it.

## Impact
- Sprint 0 audit readers could miss the current proof for operation-code ordering, production scan handoff, and scheduling WIP readback.
- The evidence chain could drift into standalone docs without a matrix guard.

## Resolution
- Added a phase-one matrix source and Sprint 0 row for the backend evidence chain.
- Added `PhaseOneMatrix_ShouldCiteEmployeeProductionSchedulingEvidenceChain`.

## Verification
- Script refresh produced `Result: PASS`.
- RED guard failed before matrix update.
- GREEN guard passed after matrix update.
