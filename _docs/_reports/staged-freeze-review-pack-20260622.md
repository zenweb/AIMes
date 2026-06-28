# Staged freeze review pack - 2026-06-22

## Purpose

Freeze the current staged index boundary before any further split work.

## Current Staged Index

- Total staged files: 98.
- Staged docs: 81.
- Staged source/test files: 17.

Note: the original frozen staged package contained 87 files. Documentation-only review records were added afterward. Staged-only verification then found missing test/runtime boundaries for `http-refresh.test.ts` and Nuxt auth middleware, so the package boundary was intentionally rebuilt with minimal source/test additions.

Staged source/test files:

- `src/frontend/middleware/auth.global.ts`
- `src/frontend/scripts/e2e.mjs`
- `src/frontend/src/api/http.ts`
- `src/frontend/src/components/employee/EmployeeBoard.vue`
- `src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue`
- `src/frontend/src/components/schedule/ScheduleBoard.vue`
- `src/frontend/src/router/index.ts`
- `src/frontend/src/stores/auth.ts`
- `src/frontend/src/utils/offline-demo-mode.ts`
- `src/frontend/tests/e2e/employee.spec.ts`
- `src/frontend/tests/e2e/scheduling.spec.ts`
- `src/frontend/tests/unit/employee-board.test.ts`
- `src/frontend/tests/unit/http-refresh.test.ts`
- `src/frontend/tests/unit/nuxt-auth-middleware.test.ts`
- `src/frontend/tests/unit/router-auth.test.ts`
- `src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts`
- `src/frontend/tests/unit/schedule-board.test.ts`

## Reviewable Packages Inside The Staged Index

1. Agent E2E current-worktree verification.
2. Employee live backend / offline-demo recovery.
3. Formal schedule writeback and Schedule fail-loud/guidance hardening.
4. Documentation-only split indexes and next-package plans.

## Latest Evidence

- Employee/offline/auth/http unit recheck: 5 files / 80 tests passed.
- Employee recovery focused Chromium E2E: 1 test passed.
- Employee live backend follow-up real browser recheck: `4173` frontend and `5003` backend listening, `aimes_offline_demo=false`, real JWT, visible `EMP-001` / `EMP-002` / `EMP-003`, no offline-demo skip text.
- Schedule focused unit recheck: 2 files / 42 tests passed.
- Schedule focused Chromium E2E recheck: 4 tests passed.
- Staged source review recheck: `_docs/_reports/staged-source-review-recheck-20260622.md` records the staged-only `http-refresh.test.ts` mock gap, the Nuxt middleware live-login redirect gap, and the passing staged-only rerun evidence: 8 unit files / 99 tests, employee E2E 1 passed, schedule E2E 4 passed.
- Employee personnel capability candidate, not staged as source: 11 focused Chromium tests and 14 full-file Chromium tests passed.
- `git diff --cached --check`: PASS.

## Explicit Non-Claims

- This staged package does not prove full frontend health.
- This staged package does not prove full backend health.
- This staged package does not include all dirty-worktree changes.
- This staged package does not complete the CC plan or v1.0.0 release gate.

## Freeze Rule

Do not add source hunks to this staged package unless explicitly rebuilding the package boundary. The latest explicit rebuild adds only the auth/session recovery pieces needed to make the package self-verifying; further implementation should start from a clean/rebuilt index or after this staged package is reviewed.
