# Production scanned exception evidence issue note

## Issue

Scanned production exception reporting did not have a dedicated test proving barcode anomaly evidence archival failures are visible to operators after the backend exception API succeeds.

## Impact

- The implementation could regress into a false success state while losing barcode/OTD anomaly evidence.
- Operators would be unable to distinguish a fully archived exception from a backend-only exception submission.

## Resolution

- Added a targeted unit test that throws only when the barcode anomaly evidence record is written.
- Verified the UI shows the existing fail-loud message and does not display the successful exception notification.
