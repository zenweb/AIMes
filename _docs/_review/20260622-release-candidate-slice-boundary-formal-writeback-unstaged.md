# Review - Formal Writeback Unstaged Boundary

## Finding

The unstaged formal writeback trace work is behaviorally promising but not package-clean.

The `ScheduleBoard.vue` and `schedule-board.test.ts` diffs are too broad to review as a single formal-writeback-only release candidate. Staging them wholesale would mix unrelated existing-feature hardening into the package and weaken audit evidence.

## Evidence

- `src/frontend/tests/e2e/scheduling.spec.ts` is `MM`, so hunk staging must preserve the already staged Agent E2E work.
- `src/frontend/tests/unit/schedule-board.test.ts` has over 3000 changed lines in the unstaged diff.
- `tmp/schedule-agent-formal-writeback-trace-20260622.patch` exists as reference evidence but is too broad for blind packaging.

## Required Next Review

Before this work can be packaged:

- manually split the formal-writeback hunks,
- rerun the focused unit and E2E tests,
- rerun `git diff --check` on the package,
- verify no unrelated Assistant/outsourcing/guidance changes are included unless explicitly scoped.
