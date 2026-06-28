# Production scanned exception evidence fail-loud plan

## Success criteria

- Backend exception submission still occurs for a scanned in-progress operation.
- Barcode anomaly evidence archival failure is surfaced as an error notification.
- Success notification and scanned anomaly evidence visibility are not shown after archival failure.
- Existing ProductionBoard behavior stays green.

## Steps

1. Inspect current ordinary and scanned exception coverage.
2. Add a targeted scanned exception evidence failure test.
3. Verify whether implementation needs a minimal fix.
4. Run targeted and component-level validation.

## Result

Completed for this slice. The test exposed the intended branch, and the existing implementation already satisfied the behavior.
