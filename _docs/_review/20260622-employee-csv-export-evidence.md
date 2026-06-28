# Review - Employee CSV Export Evidence - 2026-06-22

## Decision

Accepted as an evidence-only hardening slice.

## Review Notes

- The test validates the downloaded CSV file, not only the click handler.
- The exported file keeps inactive status evidence, which matters for audit and roster review.
- No UI or export code was changed because the current behavior passed the browser-level check.

## Verification

- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "导出员工 CSV"`: PASS, 1/1.

## Follow-Up

- If live backend roster pagination changes, add live export evidence to ensure the exported rows still match the loaded backend roster contract.
