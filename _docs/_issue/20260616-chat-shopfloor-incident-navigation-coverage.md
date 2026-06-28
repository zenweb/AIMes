# 2026-06-16 Chat Shopfloor Incident Navigation Coverage Issue

## Status

Closed for this slice.

## Problem

`ChatPanel.vue` did not directly cover the simple shopfloor incident navigation path for anomaly handling and production reporting. This matters because an operator handling a CNC incident needs both the event center and reporting screen from the assistant entry point.

## Resolution

Added a regression test that asks the assistant to open the shopfloor event anomaly center and production reporting, then verifies both actions appear exactly once.

## Evidence

- Targeted chat suite: `67 passed`.
- Chat targeted coverage: lines `86.17%`.
- Related routing/user-state regression: `99 passed`.
- Full frontend coverage: `111 files / 1034 tests passed`.
