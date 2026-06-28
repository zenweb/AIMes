# 2026-06-15 Issue: BOM success path coverage gap

## Problem

`BomBoard` had strong failure-path evidence, but several positive workflows were under-covered: backend explosion success, alternate material approval, ECN rejection, and pagination.

## Impact

- Engineers could lose the visible audit contract for alternate material approval.
- ECN rejection could fail to lock the decision and keep scheduling on the original material strategy.
- BOM explosion success and pagination could regress without focused tests.

## Resolution

- Added success-path tests to `bom-board.test.ts`.

## Verification

- Target unit: 18/18 passed.
- Focused coverage improved from statements 74.46%, branches 61.26%, functions 74%, lines 80.49% to statements 82.37%, branches 74.32%, functions 92%, lines 87.13%.
