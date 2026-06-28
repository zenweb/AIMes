# 2026-06-13 Issue: Schedule drag-save rejection lacked live evidence

## Problem

The scheduling page had mock real-dhtmlx evidence for failed drag-save, and live staging evidence for successful save/readback, but lacked live API/PostgreSQL-backed browser evidence for backend rejection.

## Impact

Without this evidence, the drag-save path could appear boutique on success while still being weak on an operator-critical failure path: a rejected save must not be reported as saved.

## Resolution

- Added a live staging test that locks the probe plan before drag-save.
- Verified the real API returns `400` with `当前计划状态不允许调整`.
- Verified the page shows `保存失败` and does not render `.schedule-save-status`.

