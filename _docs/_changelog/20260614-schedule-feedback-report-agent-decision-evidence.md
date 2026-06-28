# 2026-06-14 Schedule Feedback Report Agent Decision Evidence

## Change
- Extended schedule adoption feedback report evidence to carry the Agent decision reference, not only the reason detail and trace ID.
- Added optional `evidenceRef` to OTD evidence-chain records and populated it from `ScheduleFeedbackSnapshot.agentDecisionId`.
- Updated report drilldown explanations and CSV export rows so batch adoption feedback can be traced to the exact Agent decision evidence.

## Evidence
- `npm run test:unit -- tests/unit/report-board.test.ts -t "agent decision evidence"`
  - RED first: failed because the drilldown detail did not contain `decision-batch-balanced-001`.
  - GREEN after implementation: 1 targeted test passed.
- `npm run test:unit -- tests/unit/report-board.test.ts`
  - 1 file passed.
  - 16 tests passed.
- `npm run test:e2e -- --project=chromium tests/e2e/report.spec.ts -g "OTD 证据链消费批量对比采纳 feedback snapshot"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- This continues the existing schedule feedback boutique-hardening path.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not used as a blocker for this work item.
