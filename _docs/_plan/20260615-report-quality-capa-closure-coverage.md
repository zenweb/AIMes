# 2026-06-15 Plan: Report quality CAPA closure coverage

## Assumptions
- The current slice should harden the existing report review path, not add new report features.
- CAPA closure evidence is already produced by quality workflows and consumed by `ReportBoard`.

## Steps
1. Read the CAPA sync contract and existing `ReportBoard` template.
2. Add a focused unit test for CAPA evidence entering the OTD review report.
3. Keep production code unchanged if the existing implementation already satisfies the behavior.
4. Run targeted report, CAPA sync, and coverage verification.
5. Record the slice in changelog/review/todo/issue/plan.

## Stop condition
- The report test proves visible CAPA closure evidence, related CAPA sync tests stay green, and the coverage command completes successfully.
