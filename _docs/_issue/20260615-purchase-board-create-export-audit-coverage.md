# 2026-06-15 Issue: PurchaseBoard critical-path evidence gap

## Problem

PurchaseBoard had low function coverage on important procurement workflows. The missing evidence included successful purchase-order creation, CSV export, pagination refresh, audit replay focus, and shortage-expedite fallback behavior.

## Resolution

Added unit tests for those existing paths and verified both focused and full frontend coverage.
