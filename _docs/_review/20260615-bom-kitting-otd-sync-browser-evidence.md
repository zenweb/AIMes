# Review: BOM kitting OTD sync browser evidence

## Scope

- `src/frontend/tests/e2e/engineering-data.spec.ts`
- `_docs/_reports/bom-kitting-otd-sync-browser-evidence-20260615.md`

## Findings

- No blocking finding.
- The browser evidence covers the exact operator risk from the prior issue: secondary OTD evidence-chain sync fails after the primary BOM kitting package is written.
- The test verifies the boutique behavior expected for this existing critical path: do not duplicate the primary release, do not hide the OTD sync failure, and do not forge OTD evidence.

## Evidence

- Chromium e2e target passed: `1 passed (5.1s)`.
- The test asserts published UI state, disabled release button, visible fail-loud alert, persisted primary package, and absent OTD evidence-chain storage under injected failure.

## Residual risk

- This is focused browser evidence for the BOM kitting OTD failure mode only.
- Gray observation is still deferred by owner and is not converted into strict release PASS by this evidence.
