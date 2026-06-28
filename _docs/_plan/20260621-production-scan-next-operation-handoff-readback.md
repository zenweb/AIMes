# 2026-06-21 Plan - Production scan next-operation handoff readback

## Goal

Close the Production barcode completion gap where live scan responses only provided the current operation, preventing backend-backed downstream handoff evidence.

## Success Criteria

- `/api/v1/production/scan` returns the scanned/current operation and its next operation when one exists.
- WO-013 scan proves `OP-10 / 淬火` followed by `OP-20 / 回火`.
- ProductionBoard consumes backend `nextOperation` and renders both operations.
- Barcode completion handoff evidence can target `OP-20` without local demo fallback.
- Tests, build, REST, and browser evidence all pass.

## Status

Completed for this slice.
