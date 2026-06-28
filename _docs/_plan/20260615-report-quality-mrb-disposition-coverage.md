# 2026-06-15 Plan: Report quality MRB disposition coverage

## Assumptions
- MRB disposition is an existing quality-to-report evidence path.
- This slice should add evidence coverage, not expand feature scope.

## Steps
1. Read MRB sync contract and `ReportBoard` rendering/export code.
2. Make the MRB sync mock controllable in the report test suite.
3. Add focused report and CSV assertions for MRB disposition closure evidence.
4. Run targeted, related, and coverage verification.
5. Record changelog/review/todo/issue/plan.

## Stop condition
- MRB report and CSV behavior are covered, related MRB sync tests pass, and report coverage completes successfully.
