# 2026-06-22 Plan: Labor retry staged candidate recheck

Success criteria:
- Staged diff still matches `schedule-labor-evidence-retry`.
- Boundary report has no missing manifest files and no excluded-theme tokens.
- Hunk map has no `EXCLUDE_THEME` or `MIXED_REQUIRES_MANUAL_SPLIT` hunks.
- Focused unit and E2E tests for labor evidence retry pass.
- No claim is made that strict v1.0.0 is complete.

Execution:
1. Inspect staged status and manifest.
2. Run staged boundary and hunk-map reports.
3. Run `git diff --cached --check` and mojibake scan.
4. Run focused unit and E2E tests.
5. Record evidence in changelog/review/todo/issue/plan.

Stop condition:
- If any audit gate failed, stop staging and repair the specific candidate slice before moving to another feature.
