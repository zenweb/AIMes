# 2026-06-15 Plan: Report quality CAPA CSV evidence

## Assumptions
- CAPA closure is an existing evidence path; this slice should deepen its artifact quality instead of expanding scope.
- CSV is the local report artifact that should preserve frontend-only evidence.

## Steps
1. Compare CAPA on-screen fields with current CSV rows.
2. Write a failing test requiring CAPA review action, root cause, evidence strength, owner, and trace in CSV export.
3. Add the smallest CSV row changes in `ReportBoard`.
4. Run targeted, related, and coverage verification.
5. Record changelog/review/todo/issue/plan.

## Stop condition
- The focused CSV test passes, the full report unit suite passes, CAPA sync tests remain green, and coverage completes successfully.
