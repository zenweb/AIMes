# 2026-06-15 Issue: Scanner context evidence coverage gap

## Problem

`ScannerBoard` had focused coverage for work order fallback and failure paths, but material/equipment context navigation and successful backend evidence refresh were not directly covered.

## Impact

- A material scan could lose inventory/BOM navigation without a focused regression test.
- An equipment scan could lose equipment/monitoring navigation without a focused regression test.
- A successful backend scan evidence refresh could regress and leave the UI showing only local evidence.

## Resolution

- Added tests for backend-refreshed scan evidence, material context actions, and equipment context actions.

## Verification

- Target unit: 9/9 passed.
- Focused coverage improved from statements 77.3%, branches 59.25%, functions 72.22%, lines 82.03% to statements 87.23%, branches 75%, functions 77.77%, lines 91.4%.
