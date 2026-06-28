# Next actions - Index readiness audit - 2026-06-22

## Recommended next package

Split one remaining ScheduleBoard hardening theme at a time:

- bilingual guidance links/help affordance;
- backend-first evidence refresh/fail-loud startup;
- adoption feedback snapshot restore;
- drag-save failure hardening;
- personnel capability E2E: current unstaged candidate is only in `src/frontend/tests/e2e/employee.spec.ts`; focused Chromium evidence passed 11 tests with `--grep "Employee 人员能力约束"`.

## Guardrails

- Do not broad-stage `ScheduleBoard.vue`, `schedule-board.test.ts`, or `employee.spec.ts`.
- If keeping the employee recovery slice, preserve only the focused recovery-link hunk from `employee.spec.ts`; split broader personnel capability E2E separately.
- When splitting personnel capability E2E, stage only the unstaged `employee.spec.ts` hunks and rerun the 11-test focused command plus `git diff --cached --check`.
- Full-file compatibility evidence is currently green: `npm run test:e2e -- tests/e2e/employee.spec.ts` passed 14 Chromium tests. Re-run it after the personnel E2E split if the recovery-link hunk and personnel hunk remain in the same file.
- Do not treat personnel capability E2E as the only remaining dirty-worktree work. Full inventory currently shows 230 changed files across frontend/backend/tests/scripts/docs and needs separate package audits.
- Keep `tmp/index-agent-e2e-plus-formal-docs-20260622.patch` unstaged unless regenerated without patch-payload whitespace failures.
- Re-run `git diff --cached --check` after every package addition.
