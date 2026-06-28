# 2026-06-15 Issue: equipment audit focus detail hid trace reference

## Problem

When audit replay opened EquipmentBoard with an equipment audit target that was not present in the current list, the board created and selected a synthetic audit-focused equipment row. The banner showed the trace ID, but the selected detail panel did not show the current work order / trace reference.

## Impact

An operator reviewing equipment downtime evidence could lose the audit trace after moving attention from the banner to the detail panel, weakening the audit replay -> equipment detail handoff.

## Resolution

Added `当前工单` to the equipment overview detail panel and covered the audit-focused synthetic equipment path with a regression test.

## Evidence

- Before fix: target test failed because the detail panel did not contain `TRACE-EQ-DOWNTIME-20260615`.
- After fix: EquipmentBoard target test and full frontend coverage passed.
