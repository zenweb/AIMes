# Production scanned quality-fail evidence failure issue note

## Issue

Scanned quality-fail completion had success coverage for rework/freeze/CAPA/isolation/cost/label evidence, but no dedicated test for evidence archival failure mid-chain.

## Impact

- A future regression could show a false completion or false quality-freeze success state after only the backend completion API succeeded.
- Operators would be misled into believing downstream quality evidence was complete.

## Resolution

- Added a test that makes `barcode-hold-WO-RUSH-9001-OP-10-OP-20` archival fail.
- Verified the UI shows the completion evidence failure notification and suppresses success/freeze/CAPA/label success messages.
