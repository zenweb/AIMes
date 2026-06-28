# 2026-06-15 Plan: Report risk SLA review evidence

## Assumptions
- Risk SLA review is an existing evidence path and should be surfaced as part of report hardening.
- The CSV path already contains the data, but the page needs a visible review block.

## Steps
1. Inspect risk SLA sync contract and `ReportBoard` usage.
2. Write a failing report test requiring visible risk SLA closure evidence and CSV rows.
3. Add a minimal report block and matching compact styles.
4. Run targeted, related, and coverage verification.
5. Record changelog/review/todo/issue/plan.

## Stop condition
- Risk SLA evidence appears in the report, CSV assertions pass, related sync tests pass, and coverage completes successfully.
