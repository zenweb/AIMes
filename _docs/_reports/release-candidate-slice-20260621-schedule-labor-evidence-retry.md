# Release Candidate Slice - Schedule Labor Evidence Retry

- GeneratedAt: 2026-06-21
- Branch: V1
- Scope: small dirty-worktree slice proposed for staged review, push, and hosted CI after owner review.

## Slice Files

- `src/frontend/scripts/e2e.mjs`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/tests/e2e/scheduling.spec.ts`
- `_docs/_changelog/20260621-schedule-labor-evidence-retry.md`
- `_docs/_review/20260621-schedule-labor-evidence-retry.md`
- `_docs/_todo/20260621-schedule-labor-evidence-retry-next-actions.md`
- `_docs/_issue/20260621-schedule-labor-evidence-retry.md`
- `_docs/_plan/20260621-schedule-labor-evidence-retry.md`
- Machine-readable manifest: `_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json`

## Why This Slice

- It is a bounded continuation of the Employee -> Scheduling personnel evidence chain.
- It improves a user-critical path without expanding scope: a failed startup read of labor evidence can be retried in-page, and offline-demo personnel review falls back to local evidence instead of surfacing backend skip internals.
- It is small enough to review separately from the 3000+ entry dirty worktree inventory.

## Local Evidence

- Unit: `npm run test:unit -- tests/unit/schedule-board.test.ts --maxWorkers=1 --no-file-parallelism` passed, 75/75.
- Related unit: `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/employee-board.test.ts tests/unit/router-auth.test.ts tests/unit/login-page.test.ts --maxWorkers=1 --no-file-parallelism` passed, 127/127.
- Focused real browser: `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试"` passed, 1/1.
- Personnel real browser: `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班证据释放排产人员约束|人员无有效替班候选时排产保持停工复核事件"` passed, 2/2.
- Employee offline real browser: `npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示|backend skip"` passed, 2/2.

## CI Boundary

- This document does not claim hosted CI coverage.
- Hosted CI evidence for `V1` currently covers committed head `47d65547557a8a6cf035327ae94455a1a1285daf`, not this dirty slice.
- Next release-candidate action is to stage only the slice files above, review the staged diff, push that exact head, then regenerate hosted CI evidence pinned to the new SHA.

## Diff Size Recheck

- `git diff --stat -- src/frontend/scripts/e2e.mjs src/frontend/src/components/schedule/ScheduleBoard.vue src/frontend/tests/e2e/scheduling.spec.ts` currently reports 3691 insertions and 89 deletions.
- `scheduling.spec.ts` alone accounts for most of the size, which means this candidate is not yet a clean small review slice despite having a bounded file list.
- Do not push this as-is without staged diff review. If the staged diff includes unrelated dhtmlx/rush/order-detail E2E work, split the labor-evidence retry changes into a narrower commit or stop for owner review.

## Theme Decomposition

Current code diffs mix several independent topics:

| Theme | Main Evidence In Diff | Candidate Action |
| --- | --- | --- |
| Labor evidence retry/offline fallback | `LABOR_EVIDENCE_RETRY_TITLE`, `LEGACY_PERSONNEL_EVIDENCE_TITLES`, `mockLaborEvidenceRetryApis`, `人员证据启动读取失败后可重试`, labor branch in `generateAgentSuggestion`, `loadStartupLaborEvidence`, `retryStartupLaborEvidence` | Keep as the intended first candidate only after isolating from the rest. |
| Real dhtmlx/rush drag writeback | `RUSH_WRITEBACK_EVIDENCE_DIR`, `真实 dhtmlx ...`, `dragRushTask`, `createDhtmlxSchedulePlan`, `withRushWindow`, `handleTaskDragEnd`, `scheduleSaveStatus`, `formalScheduleWriteback` | Separate candidate; do not bundle with labor evidence retry. |
| Multi-objective compare/adoption feedback | Large block of `多目标对比...` tests, `restoreLatestFeedbackSnapshot`, `missingFeedbackSnapshotFields`, adoption feedback latest readback | Separate candidate. |
| Assistant recovery / engineering startup fail-loud | `Assistant 恢复交接...`, `loadStartupEngineeringConstraints`, `readAssistantEngineeringConstraintPackagesSafely`, route/material/engineering refresh fail-loud | Separate candidate. |
| Product guidance links | `schedule-workbench-guidance`, `schedule-workbench-help` | Small UI/core-principle candidate or bundle only with a deliberate UX slice. |

## Safer Split Order

1. Labor evidence retry/offline fallback only.
2. Real dhtmlx drag/writeback evidence.
3. Multi-objective compare/adoption feedback readback.
4. Assistant recovery and engineering evidence fail-loud.
5. Product guidance/help links if not already included in an accepted UI slice.

## Stop Conditions

- Do not stage unrelated dirty files with this slice.
- Do not claim strict v1.0.0 PASS from this slice; gray observation remains a separate wall-clock gate.
- If staged diff includes unrelated ScheduleBoard changes from earlier local work, split further or stop for owner review.

## Executable Boundary Guard

- Script: `scripts/test-release-candidate-slice-boundary.ps1`.
- Working report: `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-working.md` is `FAIL`, because excluded-theme tokens are still present in the candidate code diff.
- Staged report: `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged.md` is `FAIL`, because no first-slice candidate tokens are currently staged.
- Use `-DiffMode staged` after staging the intended labor-only patch; the guard now rejects empty staged diffs.
- Use the working report token-location sections as the split map before staging.
