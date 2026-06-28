# 2026-06-19 Plan: Quality rework evidence fail-loud

## Success Criteria
- Rework impact evidence archival failures are shown as assertive quality alerts.
- Failed archival does not replace the existing rework preview with unpersisted evidence.
- Failed archival does not show the success sync message.
- Existing quality board behavior remains green.

## Execution
- Add a RED unit test for failed `writeQualityReworkImpact`.
- Verify the test fails because the current handler lets the storage error escape.
- Add the smallest handler-level try/catch around rework evidence archival.
- Re-run targeted and component tests.
- Run full frontend coverage, lint, and build.

## Result
- Criteria met.
- Full frontend coverage passed: 111 files / 1104 tests.
- Strict release completion remains gated by gray observation.
