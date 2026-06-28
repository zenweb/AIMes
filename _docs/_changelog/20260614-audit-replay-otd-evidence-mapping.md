# 2026-06-14 Audit Replay OTD Evidence Mapping

## Change
- Added focused unit evidence for existing audit decision replay behavior.
- Covered OTD evidence chain replay for:
  - customer commitment package as the default replay chain;
  - outsourcing schedule release without counting vendor wait as internal recovery;
  - barcode quality gate release with downstream handoff safeguards.
- Hoisted the `readOtdEvidenceChainRecords` mock so each scenario can provide deterministic replay-chain records.

## Evidence
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`
  - 1 file passed.
  - 23 tests passed.
- `npm run test:unit:coverage -- tests/unit/audit-decision-replay-panel.test.ts`
  - `src/components/auditLog/AuditDecisionReplayPanel.vue`: statements 77.52%, branches 36.54%, functions 86.73%, lines 77.52%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 664 tests passed.
  - global statements 77.75%, branches 62.55%, functions 73.51%, lines 81.48%.
- `npm run test:e2e -- tests/e2e/scanner.spec.ts -g "扫码确认现场执行证据进入报表与审计回放"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- No production code change was required; this was an evidence hardening slice for an existing user-critical audit replay path.
- Gray observation remains skipped/deferred by owner direction and is not used as a blocker for this work item.
