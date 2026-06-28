# Next Actions: Employee Offline Demo Evidence Script

## Immediate
- Use `scripts/run-employee-offline-demo-evidence.ps1` after changes to auth, offline-demo mode, EmployeeBoard loading, or frontend preview routing.
- Prefer the current preview on `4174` for this slice unless `4173` is explicitly rebuilt from the latest code.

## Follow-up Candidates
- Link this evidence script from the Sprint 0 baseline evidence matrix.
- Add a bounded smoke runner that groups Employee -> Production -> Scheduling user-critical checks.
- Keep real backend employee failures loud; only expected offline-demo backend skips should be quiet.

## Boundary
- Do not treat this script as hosted CI, staging, or full-suite proof.
