# Release Candidate Slice Split Map - Schedule Labor Evidence Retry

- GeneratedAt: 2026-06-21T20:12:43+08:00
- Source reports:
  - `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-working.md`
  - `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged.md`
- Current boundary status: `working=FAIL`, `staged=FAIL`.
- Purpose: turn token-location evidence into a reviewable split map before any staging or push.

## Current Diff Weight

| File | Insertions | Deletions | Split Risk |
| --- | ---: | ---: | --- |
| `src/frontend/scripts/e2e.mjs` | 11 | 2 | Mixed runner routing: labor retry and real dhtmlx are in the same small hunk. |
| `src/frontend/src/components/schedule/ScheduleBoard.vue` | 548 | 49 | Mixed product implementation: labor retry, guidance links, feedback readback, assistant engineering fail-loud. |
| `src/frontend/tests/e2e/scheduling.spec.ts` | 3132 | 38 | Very high: labor retry tests are mixed with assistant recovery, multi-objective, and real dhtmlx suites. |

## First Slice Keep Set

Only these changes belong in the first candidate:

| Area | Keep Locations | Notes |
| --- | --- | --- |
| E2E runner labor live mode | `src/frontend/scripts/e2e.mjs:14` | Keep `人员证据启动读取失败后可重试` routing only. Exclude `真实 dhtmlx` routing from this slice. |
| ScheduleBoard retry UI | `ScheduleBoard.vue:136`, `2769` | Keep retry button and `人员资质证据刷新失败` status path. |
| ScheduleBoard startup labor read | `ScheduleBoard.vue:1867`, `1898`, `3065` | Keep `loadStartupLaborEvidence` call chain. |
| ScheduleBoard retry handler | `ScheduleBoard.vue:1892` | Keep `retryStartupLaborEvidence`. |
| ScheduleBoard current labor evidence computed state | `ScheduleBoard.vue:1909`, `1915`, `1922`, `1944`, `1971`, `1995`, `2738`, `2739` | Keep active labor reassignment/block resolution needed by the retry and offline fallback behavior. |
| E2E constants/helpers | `scheduling.spec.ts:7-10`, `26`, `37`, `44`, `46`, `3774` | Keep `LABOR_EVIDENCE_RETRY_TITLE`, legacy personnel titles, and `mockLaborEvidenceRetryApis`. |
| E2E labor scenarios | `scheduling.spec.ts:2898`, `2924`, `2952` | Keep only the three labor/personnel scenarios already proven by focused E2E. |

## Exclude From First Slice

These tokens must not appear in the staged labor-only diff:

| Theme | Locations | Candidate |
| --- | --- | --- |
| Real dhtmlx/rush drag writeback | `e2e.mjs:9`; `scheduling.spec.ts:6`, `22`, `33`, `3116`, `3136`, `3273-3491`, `3623`, `3729`, `3921-3962` | Separate real-dhtmlx writeback candidate. |
| Multi-objective/adoption feedback readback | `ScheduleBoard.vue:902`, `918`, `928`, `3063`; `scheduling.spec.ts:741-2707` | Separate multi-objective feedback candidate. |
| Assistant recovery / engineering fail-loud | `ScheduleBoard.vue:1811`, `1832`, `2984-2999`, `3064`, `3068`; `scheduling.spec.ts:355-478` | Separate assistant engineering fail-loud candidate. |
| Schedule guidance/help links | `ScheduleBoard.vue:33`, `41`, `45`, `3157-3363` | Separate UI guidance candidate. |

## Recommended Mechanical Split

1. Create a labor-only patch from the keep set above.
2. Stage only:
   - `src/frontend/scripts/e2e.mjs` labor retry runner routing.
   - `src/frontend/src/components/schedule/ScheduleBoard.vue` labor startup/retry state and UI.
   - `src/frontend/tests/e2e/scheduling.spec.ts` labor retry helper and the three labor/personnel tests.
   - `_docs/_changelog/20260621-schedule-labor-evidence-retry.md`
   - `_docs/_review/20260621-schedule-labor-evidence-retry.md`
   - `_docs/_todo/20260621-schedule-labor-evidence-retry-next-actions.md`
   - `_docs/_issue/20260621-schedule-labor-evidence-retry.md`
   - `_docs/_plan/20260621-schedule-labor-evidence-retry.md`
3. Run the boundary guard in `working` mode after the split; it should have no excluded-theme hits for the labor candidate.
4. Run the boundary guard in `staged` mode after staging; it must include first-slice tokens and no excluded-theme tokens.
5. Run focused evidence:
   - `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试"`
   - `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班证据释放排产人员约束|人员无有效替班候选时排产保持停工复核事件"`
   - `npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示|backend skip"`

## Stop Conditions

- Stop if `staged` guard sees any excluded theme token.
- Stop if staged `scheduling.spec.ts` diff still includes the large `多目标对比` block.
- Stop if staged diff includes `真实 dhtmlx`, `dragRushTask`, `createDhtmlxSchedulePlan`, or `withRushWindow`.
- Stop if staged diff includes `Assistant 恢复交接` or `schedule-workbench-guidance`.
- Do not claim hosted CI or v1.0.0 PASS from this split map.
