# 2026-06-13 Changelog: Schedule dhtmlx evidence audit

## Changed

- Added `scripts/run-schedule-dhtmlx-evidence-audit.ps1`.
- Generated `_docs/_reports/schedule-dhtmlx-evidence-audit-20260613.md`.
- The audit verifies the scheduling real dhtmlx evidence package across mock success, mock refresh readback, mock rejected save, live staging save/readback, and live staging rejected save.

## Verification

- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-schedule-dhtmlx-evidence-audit.ps1 -ReportPath _docs/_reports/schedule-dhtmlx-evidence-audit-20260613.md` => PASS.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` => 26 passed.

