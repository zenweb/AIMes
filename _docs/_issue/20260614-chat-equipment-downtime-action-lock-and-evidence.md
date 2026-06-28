# 2026-06-14 Issue - Chat Equipment Downtime Action Lock and Evidence

## Problem
- The AI assistant equipment downtime package action remained enabled after successful package generation.
- Repeated activation could write duplicate equipment downtime and OTD evidence records.

## Impact
- Duplicate equipment downtime evidence can pollute equipment, scheduling, report, and audit replay chains.
- The affected path is user-critical because equipment downtime is a common recovery and OTD-risk workflow.

## Resolution
- Added the equipment downtime action id to `completedActionIds` after package creation succeeds.
- Verified the existing completed-action guard blocks repeated execution.
- Added unit and Chromium evidence that the action is disabled after success.

## Status
- Resolved and verified with unit, focused Chromium e2e, and full frontend unit coverage.
