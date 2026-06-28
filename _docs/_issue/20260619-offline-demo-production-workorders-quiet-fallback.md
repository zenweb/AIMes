# 2026-06-19 Issue - Offline Demo Production Workorders Quiet Fallback

## Fixed In This Slice
- Production offline demo displayed technical text from the intentional backend skip:
  - `Offline demo mode skipped backend request: /api/v1/scheduling/workorders`
- The UI now keeps local production work orders visible without showing this technical skip message.

## Still Open
- The first broad route sweep revealed direct-navigation redirects for several routes, so it cannot yet prove the entire offline-demo surface is clean.
- A corrected route sweep is still required before closing the offline-demo leak audit.

## Impact
- Production page offline demo is quiet for initial work-order fallback.
- Real backend failures still alert the operator, preserving fail-loud behavior outside intentional offline demo skips.

