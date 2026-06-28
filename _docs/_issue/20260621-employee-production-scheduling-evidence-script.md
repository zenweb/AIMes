# Issue: Employee Production Scheduling Evidence Script

## Problem
The current evidence chain relied on manually retyping several focused `dotnet test` commands. That made reruns error-prone and encouraged unbounded full-suite attempts.

## Impact
- Sprint 0 baseline work could waste time on test selection, file locks, or full-suite timeout instead of proving the current user-critical path.
- Evidence was harder to hand off for review because commands were scattered across chat history.

## Resolution
- Added a bounded evidence script.
- Added architecture enforcement so the script keeps the frontend-copy opt-out and focused filters.
- Generated a current PASS report.

## Verification
- Architecture rule: PASS.
- Script report: `_docs/_reports/employee-production-scheduling-evidence-20260621-current.md`, `Result: PASS`.

