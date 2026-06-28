# 2026-06-13 Plan: Schedule live staging rejection evidence

## Goal

Deepen the existing scheduling drag-save feature by proving the rejected-save path with real dhtmlx, real browser, real API, and PostgreSQL-backed state.

## Scope

- No new scheduling feature.
- Add evidence for the non-editable-plan rejection path.
- Preserve the existing successful save/readback evidence.

## Validation

- Unit test for `ScheduleBoard` save status remains green.
- Mock real dhtmlx failed-save E2E remains green.
- Live staging real dhtmlx success/readback and rejection tests both pass.

