# 2026-06-05 Issue - Barcode Print Board Inventory Load Fail Loud

## Problem

`BarcodePrintBoard.vue` 在 `getInventoryList()` 失败时只回退到 demo 库存数据，没有把失败原因告诉操作员。

## Impact

- 用户看不到首屏库存列表失败原因。
- 条码打印入口会显得“正常可用”，但实际已经依赖 demo 数据。
- 这类静默回退会污染现场追溯与打印决策。

## Fix

- 引入 `loadError`。
- 在库存加载失败时显示 assertive alert，保留 demo 库存和追溯标签批次。

## Status

- 已修复并通过目标单测与 lint。
