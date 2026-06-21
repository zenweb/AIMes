# Labor retry final staged audit index

## Candidate

- Name: `schedule-labor-evidence-retry`
- Scope: 排产人员证据启动读取失败 fail-loud、重试、后端优先读取、证据释放后刷新排产人员约束。
- Boundary: staged-only candidate.

## Staged Code Files

- `src/frontend/src/api/executionEvidence.ts`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/src/utils/labor-assignment-sync.ts`
- `src/frontend/tests/e2e/scheduling.spec.ts`

## Staged Evidence Documents

- `_docs/_changelog/20260621-labor-retry-staged-only-e2e.md`
- `_docs/_issue/20260621-labor-retry-staged-only-e2e.md`
- `_docs/_plan/20260621-labor-retry-staged-only-e2e.md`
- `_docs/_review/20260621-labor-retry-staged-only-e2e.md`
- `_docs/_todo/20260621-labor-retry-staged-only-e2e-next-actions.md`

## Boundary Reports

- `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-final.md`: PASS.
- `_docs/_reports/release-candidate-slice-hunk-map-20260621-schedule-labor-evidence-retry-staged-final.md`: 17 KEEP_CANDIDATE, 6 NEUTRAL_REVIEW, 0 EXCLUDE/MIXED.
- `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-after-agent-doc-unstage.md`: PASS after removing incomplete Agent docs from staged.
- `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-post-review-fix.md`: PASS after fixing staged mojibake copy.
- `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry-staged-post-review-final.md`: PASS after final staged review refresh.
- `_docs/_reports/release-candidate-slice-hunk-map-20260621-schedule-labor-evidence-retry-staged-post-review-final.md`: 17 KEEP_CANDIDATE, 6 NEUTRAL_REVIEW, 0 EXCLUDE/MIXED.

## Verification

- `git diff --cached --check`: PASS.
- Staged mojibake scan for labor retry copy: PASS, no `姝|浜哄|绾︽|锛|鏈|閲嶈` hits in cached `ScheduleBoard.vue` diff.
- `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/skill-matrix-panel.test.ts`: 92 tests PASS.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班|人员证据|人员无有效替班"`: 3/3 PASS.
- Staged-only clean worktree verification:
  - Applied `git diff --cached --binary` to detached `HEAD 47d65547557a8a6cf035327ae94455a1a1285daf` at `tmp/labor-retry-staged-worktree`.
  - `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts tests/unit/schedule-board.test.ts tests/unit/skill-matrix-panel.test.ts --maxWorkers=1 --no-file-parallelism`: 29 tests PASS in the clean worktree.
  - `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班|人员证据|人员无有效替班"`: 3/3 PASS in the clean worktree.

## Explicit Non-Scope

- Agent Workbench backend API E2E repair is not included in this staged candidate.
- Full `tests/e2e/scheduling.spec.ts` is not certified green by this candidate.
- `src/frontend/tests/e2e/scheduling.spec.ts` remains mixed (`MM`) in the worktree; do not run whole-file staging without a fresh hunk map and boundary report.

## Review Decision

This candidate is internally consistent and ready for human review as a staged-only release candidate slice. The next implementation slice should treat Agent Workbench E2E as separate code + docs work.
