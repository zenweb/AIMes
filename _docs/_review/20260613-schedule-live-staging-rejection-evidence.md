# 2026-06-13 Review: Schedule live staging rejection evidence

## Review result

The scheduling drag-save path now has live staging evidence for both successful persistence and non-editable-plan rejection.

## Findings

- The backend already rejects non-editable plans through `RescheduleItemAsync` with `当前计划状态不允许调整`.
- The frontend already clears `scheduleSaveStatus` and shows `保存失败` when the live API rejects a drag-save.
- The missing piece was real-browser/live-API evidence proving the page does not show a success status after the backend rejection.

## Verification

- New live staging rejection test passes with real Docker PostgreSQL/API.
- Existing live staging success/readback test still passes in the same serial group.
- Initial parallel validation hit `EADDRINUSE 127.0.0.1:4173`; rerunning the mock E2E serially passed. This was a validation scheduling issue, not a product failure.

