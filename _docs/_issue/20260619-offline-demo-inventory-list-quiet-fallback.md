# 2026-06-19 Issue: Offline Demo Inventory List Quiet Fallback

## Problem
Real browser verification showed `/scheduling/inventory?offlineDemo=1` displayed:

`库存列表加载失败，已显示本地演示物料：Offline demo mode skipped backend request: /api/v1/inventory`

## Root Cause
The inventory list catch block treated offline demo transport skips like real backend failures and copied the technical skip message into the user-facing notification.

## Resolution
- Imported `isOfflineDemoError`.
- In `loadData()`, local demo inventory is still populated, but `OfflineDemoApiError` clears the notification and returns without rendering an alert.
- Ordinary backend failures still render the existing fail-loud inventory list alert.

## Status
Resolved for inventory-list startup loading.
