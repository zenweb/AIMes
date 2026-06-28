# 2026-06-19 Issue: Production scan API barcode context

## Problem
- Manual production scan API success selected the operation but did not build barcode production context.

## Impact
- Operators could scan a work-order barcode in production reporting and see the operation, but not the barcode context actions for start, completion, and exception evidence.
- This made manual scan behavior weaker than route `scanCode` entry from the scanner page.

## Root Cause
- `handleScan` returned immediately after setting `currentOperations` in the scan API success branch.
- Barcode context construction only existed in route entry and local fallback paths.

## Fix
- Build barcode production context in the scan API success branch when the scanned code is a work-order barcode.

## Evidence
- RED test reproduced the missing `.barcode-start-context`.
- Production component suite and full frontend regression passed after the fix.
