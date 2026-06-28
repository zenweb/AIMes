# 2026-06-13 Plan: Schedule dhtmlx evidence audit

## Goal

Package the existing scheduling real dhtmlx drag-save evidence into a single auditable report.

## Scope

- No product behavior change.
- Verify evidence artifacts and manifest anchors.
- Preserve strict distinction between mock browser evidence and live staging API/PostgreSQL evidence.

## Validation

- Evidence audit script returns PASS.
- `ScheduleBoard` unit suite remains green.

