# 2026-06-14 Issue - Report CSV Keeps Evidence Load Fail Loud

## Problem
- ReportBoard could show a report evidence-load failure during startup, then hide that diagnostic after the user successfully exported CSV.
- The user action succeeded, but the earlier evidence-load problem had not been resolved.

## Root Cause
- Startup evidence failures and later report operation failures shared the same `reportActionError` state.
- `handleExportCsv()` cleared `reportActionError` after a successful download, so it also cleared unrelated evidence-load diagnostics.

## Fix
- Introduced separate evidence-load and operation error lanes.
- Rebuilt the visible alert from both lanes.
- Changed CSV success to clear only the operation lane.

## Remaining Issue
- `npm run test:unit:coverage` still emits the existing warning: `--localstorage-file was provided without a valid path`.
- The warning is not caused by this slice and remains a separate cleanup item.

