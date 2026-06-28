# 2026-06-14 Issue - Chat Anomaly Action Lock and Evidence

## Problem
- The AI assistant anomaly disposition card action remained enabled after successful card creation.
- Repeated activation could write duplicate anomaly disposition package and assistant action audit evidence.

## Impact
- Duplicate anomaly evidence can pollute anomaly management, risk action queues, scheduling events, OTD evidence, and audit replay.
- The affected path is user-critical because anomaly disposition is a core production recovery workflow.

## Resolution
- Added the anomaly disposition action id to `completedActionIds` after card creation succeeds.
- Verified the existing completed-action guard blocks repeated execution.
- Added unit and Chromium evidence that the action is disabled after success.

## Status
- Resolved and verified with unit, focused Chromium e2e, and full frontend unit coverage.
