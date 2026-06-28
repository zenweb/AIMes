# Plan: BOM kitting OTD sync browser evidence

## Goal

Prove in a real browser that BOM kitting package publication remains locked and fail-loud when OTD evidence-chain storage fails.

## Steps

1. Reuse the existing `engineering-data.spec.ts` BOM kitting flow.
2. Inject failure only for `aimes_otd_evidence_chain` writes.
3. Publish the BOM-A100 kitting package.
4. Assert published UI state, disabled button, fail-loud alert, primary package persistence, and no forged OTD evidence-chain record.
5. Run the focused Chromium e2e through the existing isolated wrapper.
6. Record evidence and residual release-gate status.

## Result

Focused Chromium e2e passed. The existing production fix now has real-browser evidence for the OTD evidence-chain failure mode.
