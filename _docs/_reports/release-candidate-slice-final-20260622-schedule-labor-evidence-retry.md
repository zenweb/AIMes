# Release Candidate Slice Final - Schedule Labor Evidence Retry - 2026-06-22

## Scope

Final verification for the staged `schedule-labor-evidence-retry` candidate package.

## Staged Code Scope

- `src/frontend/src/api/executionEvidence.ts`
- `src/frontend/src/utils/labor-assignment-sync.ts`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/tests/e2e/scheduling.spec.ts`

## Result

PASS.

The staged package is ready for package-level handoff from this verification pass.

## Validation Commands

```powershell
git diff --cached --check
npm run test:unit -- labor-assignment-sync execution-evidence-api schedule-board
npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试" --project=chromium
```

## Validation Output Summary

- `git diff --cached --check`: PASS
- Unit tests: PASS
  - 3 files
  - 89 tests
- Focused Chromium E2E: PASS
  - `Scheduling 排产甘特图 > 人员证据启动读取失败后可重试并释放排产人员约束`
  - 1 test passed

## Functional Evidence

The focused browser test proves:

- Startup labor evidence backend read failure is surfaced in the schedule warning bar.
- The warning includes the backend failure reason.
- A retry button is visible.
- Retry performs another backend read for both labor qualification blocks and labor reassignments.
- The startup warning clears after successful retry.
- Labor reassignment evidence releases the scheduling labor constraint.
- Event queue shows the closed labor event.
- Agent workbench and Gantt rendering remain available after retry.

## Non-Claims

- This does not claim the full CC plan is complete.
- This does not include Agent E2E patch integration.
- This does not replace the later full release-gate audit.
