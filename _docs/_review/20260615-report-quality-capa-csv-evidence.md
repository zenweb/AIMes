# 2026-06-15 Review: Report quality CAPA CSV evidence

## Result
- Pass. CAPA closure evidence shown in the OTD review report now travels with the CSV report pack.

## Checks
- CSV export includes:
  - CAPA verification task.
  - OTD review impact.
  - Review action.
  - Root cause, evidence strength, and owner.
  - Trace ID.
- The change is scoped to `ReportBoard` CSV rows and does not alter page rendering or CAPA sync storage.

## Risk
- Evidence strength is displayed with the existing report-page percentage convention: `Math.round(evidenceStrength * 100)%`.
