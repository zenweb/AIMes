# Issue: Employee Offline Demo Evidence Script

## Problem
The Employee offline-demo path could regress back to a raw technical message:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

Without a repeatable evidence command, future work could rely on manual browser checks and miss stale preview or wrapper-error cases.

## Impact
- Operators see implementation details instead of a quiet local demo fallback.
- Sprint 0 baseline evidence becomes harder to audit.
- Old preview ports can confuse validation if they are not clearly separated from the current build.

## Resolution
- Added `scripts/run-employee-offline-demo-evidence.ps1`.
- Added `FrontendEmployeeOfflineDemoEvidenceEntrypoint_ShouldBeRepeatableAndBounded`.
- Generated the current passing evidence report.

## Verification
- Focused architecture guard: PASS.
- Script-generated report: PASS.
