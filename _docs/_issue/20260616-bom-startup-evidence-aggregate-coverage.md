# 2026-06-16 BOM Startup Evidence Aggregate Coverage Issue

## Status

Closed for this slice.

## Problem

`BomBoard.vue` did not directly cover simultaneous startup failures for alternate-material evidence and BOM kitting evidence. In the engineering-data path, hiding one failure behind another can make the operator believe a cross-module release path is cleaner than it is.

## Resolution

Added a regression test that rejects both backend-first reads and verifies the BOM list remains usable while both failure reasons are surfaced in the alert.

## Evidence

- Targeted BOM suite: `20 passed`.
- BOM targeted coverage: lines `88.11%`.
- Related regression: `4 files / 36 tests passed`.
- Full frontend coverage: `111 files / 1035 tests passed`.
