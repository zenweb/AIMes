# 2026-06-14 Report CSV Keeps Evidence Load Fail Loud

## Changed
- Hardened the existing ReportBoard CSV export path so a successful CSV download no longer clears prior report evidence load failures.
- Split report alert state into evidence-load failures and operation failures, then recomposed the user-visible alert from both lanes.
- Kept follow-up report operations free to clear their own operation error without hiding startup evidence diagnostics.

## Verification
- RED confirmed: `npm run test:unit -- tests/unit/report-board.test.ts -t "keeps report evidence load failures visible"` failed against the prior behavior because the alert disappeared after CSV export.
- GREEN focused unit: `npm run test:unit -- tests/unit/report-board.test.ts -t "keeps report evidence load failures visible"` -> 1 passed.
- GREEN report unit: `npm run test:unit -- tests/unit/report-board.test.ts` -> 19 passed.
- GREEN real browser focused: `npm run test:e2e -- tests/e2e/report.spec.ts -g "CSV 导出成功后仍保留" --project=chromium` -> 1 passed.
- GREEN report real browser: `npm run test:e2e -- tests/e2e/report.spec.ts --project=chromium` -> 20 passed.
- GREEN frontend coverage: `npm run test:unit:coverage` -> 105 files passed, 774 tests passed, global line coverage 84.07%, `ReportBoard.vue` line coverage 78.54%.

## Notes
- This slice only claims the CSV/export alert-state hardening. Other ReportBoard changes already present in the dirty worktree are not claimed here.
- Gray observation remains owner-skipped/deferred and is not a blocker for this slice.

