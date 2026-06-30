# 2026-06-30 Report E2E Fail-Loud Source Context Closure

## Changed

- Added source hints to Report startup evidence fail-loud aggregation.
- Preserved API/local context in Report evidence load errors, including customer order import, equipment fault, OTD evidence chain, adoption feedback, and quality evidence sources.
- Scoped the Report Excel export E2E assertion to the ReportBoard alert instead of the page-wide alert set.

## Evidence

- Focused failing cluster re-run passed: 3 Chromium tests.
- Full `tests/e2e/report.spec.ts` passed: 20 Chromium tests.

## Not Complete

- Full frontend E2E has not been re-run to completion in this change.
- Full Achievement is not complete.
