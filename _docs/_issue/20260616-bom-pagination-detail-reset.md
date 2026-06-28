# 2026-06-16 BOM Pagination Detail Reset Issue

## Issue

BomBoard list pagination could leave the previous page's selected BOM detail visible after the operator moved to another page.

## Impact

The list could show `产品C 物料清单` while the detail panel still showed `产品A 物料清单`. This is a serious context mismatch for BOM governance because the right panel contains ECN, alternate-material, and kitting package actions.

## Root Cause

`goToPage()` loaded the new page but did not reset `selected` or `explosion`.

## Fix

Clear `selected` and `explosion` before loading the requested page.

## Evidence

- Red test failed before fix because `.empty-state` was missing and stale `产品A 物料清单` detail remained visible.
- Single test passed after fix.
- Targeted BomBoard coverage passed: `21 tests`.
- Full frontend coverage passed: `111 files / 1061 tests`.
