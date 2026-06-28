# 2026-06-16 Scanner API Payload Shape Fail Loud Plan

## Goal

Make scanner API payload-shape failures fail loud instead of rendering malformed scan results.

## Success Criteria

- A successful HTTP response with a non-scan payload is rejected.
- The scanner page shows a visible alert with `扫码查询返回非扫码结果载荷`.
- No scan result card is rendered for malformed payloads.
- No scan history entry is written for malformed payloads.
- Targeted ScannerBoard unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Selected `ScannerBoard.vue` by coverage leverage plus shop-floor criticality.
2. Read manual scan, API fallback, result rendering, and history writing flow.
3. Added a failing regression test for HTML fallback returned as successful scan API data.
4. Added minimal scan result shape validation and a dedicated malformed-payload path.
5. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value from a fresh baseline. Good candidates remain `GanttChart.vue`, `AdminBoard.vue`, `ScheduleBoard.vue`, `DocumentUpload.vue`, and scanner follow-up only if a fresh real workflow gap is found.
