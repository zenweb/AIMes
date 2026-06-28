# Report quality rework impact coverage review

## Scope

- Files reviewed: `src/frontend/src/components/report/ReportBoard.vue`, `src/frontend/tests/unit/report-board.test.ts`, `src/frontend/src/utils/quality-rework-sync.ts`.
- This slice targets the report-center quality rework impact evidence block.

## Findings

- Production reporting coverage is now relatively high, so this slice moved to report-center OTD review coverage by leverage.
- `ReportBoard` already rendered quality rework impact evidence, but the existing test mock always returned `null`, leaving the branch unproven.
- The new test verifies work order, process, rework window, OTD risk, and recommended action visibility.

## Verification

- Targeted ReportBoard test, full ReportBoard unit suite, related quality rework panel suite, and targeted coverage suite pass.
- No production code changed; only test control and regression evidence were added.
