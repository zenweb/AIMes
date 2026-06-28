# Issue: BOM kitting OTD sync lock needed real-browser evidence

## Symptom

The unit test proved that BOM kitting publication locks after primary persistence even when OTD evidence-chain sync fails, but there was no Chromium-level evidence for the actual operator flow.

## Risk

Without real-browser evidence, the UI could still regress through route setup, browser storage behavior, DOM state, or alert rendering while unit tests stay green.

## Resolution

Added a targeted Chromium e2e that injects `aimes_otd_evidence_chain` storage failure, publishes the BOM-A100 kitting package, and verifies:

- the primary package is published and stored;
- the release button is disabled;
- the OTD sync failure alert is visible;
- OTD evidence-chain storage is not forged.

## Status

Resolved for this browser scenario. Command passed with 1/1 Chromium test.
