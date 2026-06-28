# 2026-06-15 Plan - ScheduleBoard 质量释放采纳证据

Success criteria:
- Barcode quality release appears in the schedule event queue.
- The event generates an OP-20 schedule recovery Agent recommendation.
- Accepting the suggestion persists release trace context locally and to backend feedback.
- Focused and full frontend tests remain green.
- Current runtime/operator files do not steer new runs to host `localhost:5000`.

Execution:
1. Inspect quality release event mapping and `readBarcodeScheduleReleaseRecord`.
2. Hoist `readOtdEvidenceChainRecords` for test control.
3. Add focused quality release adoption test.
4. Run focused unit, focused coverage, full frontend coverage, and current 5000 scan.

Result:
- Frontend quality-to-schedule handoff slice complete and verified.
- Larger CC goal remains active.
