# 2026-06-14 Issue - Production Completion Lock and Evidence

## Problem
- A completed production operation confirmation could be triggered twice before the UI fully settled.
- The duplicate trigger called `completeOperation` twice and risked duplicate OTD completion / production closeout evidence.

## Impact
- Duplicate completion evidence can pollute production, scheduling, report, and audit replay chains.
- The affected path is user-critical because production completion is a core manufacturing workflow.

## Resolution
- Added completion submission tracking and completed-state guards.
- Disabled the completion confirm button when the operation is already completed or submitting.
- Preserved retry behavior for backend completion failures.

## Status
- Resolved and verified with unit, focused Chromium e2e, and full frontend unit coverage.
