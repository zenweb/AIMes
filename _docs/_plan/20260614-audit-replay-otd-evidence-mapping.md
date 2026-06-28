# 2026-06-14 Plan - Audit Replay OTD Evidence Mapping

## Goal
- Harden evidence for an existing audit replay feature without expanding scope.

## Success Criteria
- OTD replay chain tests cover customer commitment, outsourcing release, and barcode quality gate scenarios.
- Focused component tests pass.
- Full frontend unit coverage remains green.
- A relevant Chromium scanner-to-audit replay path passes after production build.
- Gray observation is not used as a blocker for this work item.

## Execution
- Read existing `audit-decision-replay-panel.test.ts` patterns.
- Hoist the OTD evidence-chain mock so per-test records can drive replay selection.
- Add focused tests that assert business-specific replay wording and trace evidence.
- Run focused unit tests, focused coverage, full coverage, and focused e2e.

## Result
- Success criteria met for this slice.
- Next slice should move to another low-coverage, user-critical existing feature rather than continuing to refine this already-improved path.
