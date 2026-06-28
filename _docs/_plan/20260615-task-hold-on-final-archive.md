# 2026-06-15 Task Hold On Final Archive Plan

## Objective

Freeze the current AIMes V1 continuation work so GPT 5.6 or the next agent can resume from concrete state instead of memory.

## Hold Rules

- Do not continue implementation while `.omx/state/task-hold-on.json` says `hold_on`.
- Do not claim strict v1.0.0 release readiness while gray observation is owner-deferred.
- Do not use backend port `5000`; use `5003` for local backend/staging work.
- Do not revert unrelated dirty worktree changes.

## Resume Steps

1. Re-read `.omx/state/task-hold-on.json`.
2. Re-read this archive packet:
   - `_docs/_changelog/20260615-task-hold-on-final-archive.md`
   - `_docs/_review/20260615-task-hold-on-final-archive.md`
   - `_docs/_plan/20260615-task-hold-on-final-archive.md`
   - `_docs/_todo/20260615-task-hold-on-final-archive-next-actions.md`
   - `_docs/_issue/20260615-task-hold-on-final-archive.md`
3. Run `git status --short` and separate inherited dirty files from new work.
4. Before coding, re-run the targeted scheduling baseline from `src/frontend`:
   - `npm run test:unit -- tests/unit/schedule-board.test.ts --reporter=dot`
   - `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --reporter=dot --coverage.reporter=text`
5. If continuing the paused slice, inspect `ScheduleBoard.vue` around the outsourcing commitment review branch before adding tests.
6. Stop again if the next branch requires unclear business intent rather than guessing.

## Stop Condition

Remain on hold until the owner explicitly resumes implementation or verification.
