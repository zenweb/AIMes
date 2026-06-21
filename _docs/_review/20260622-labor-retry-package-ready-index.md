# Labor Retry Package Ready Index - 2026-06-22

## Package

`schedule-labor-evidence-retry`

## Status

READY FOR PACKAGE-LEVEL HANDOFF.

## Staged File Count

32 files.

## Included Code Files

- `src/frontend/src/api/executionEvidence.ts`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/src/utils/labor-assignment-sync.ts`
- `src/frontend/tests/e2e/scheduling.spec.ts`

## Included Evidence

- Original staged E2E evidence from 2026-06-21.
- Staged boundary and hunk-map reports.
- Code audit pass evidence from 2026-06-22.
- Final focused verification pass evidence from 2026-06-22.

## Latest Validation

- `git diff --cached --check`: PASS
- `npm run test:unit -- labor-assignment-sync execution-evidence-api schedule-board`: PASS, 89 tests
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试" --project=chromium`: PASS, 1 Chromium test

## Explicitly Excluded

The following current worktree evidence remains unstaged and must be packaged separately:

- Agent E2E current-worktree verification docs.
- Package-boundary index docs.
- Unstaged Agent E2E hunks in `src/frontend/scripts/e2e.mjs`.
- Any unstaged hunks in `src/frontend/tests/e2e/scheduling.spec.ts`.

## Decision

This package is now ready to be committed or otherwise handed off as an isolated labor retry slice. Do not add unrelated files before handoff.
