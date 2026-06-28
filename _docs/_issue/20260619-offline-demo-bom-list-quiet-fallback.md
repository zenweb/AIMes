# 2026-06-19 Issue: Offline Demo BOM List Quiet Fallback

## Problem
Real browser verification showed `/scheduling/bom?offlineDemo=1` could display:

`BOM 列表加载失败：Offline demo mode skipped backend request: /api/v1/bom`

## Root Cause
The BOM list catch block treated offline demo transport skips like real backend failures and copied the technical skip message into the user-facing alert.

## Resolution
- Imported `isOfflineDemoError`.
- In `loadBoms()`, local demo BOM records are still populated, but `OfflineDemoApiError` does not set the BOM-list failure alert.
- Ordinary backend failures still render the existing fail-loud BOM-list alert.

## Status
Resolved for BOM-list startup loading.
