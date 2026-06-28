# 2026-06-14 Issue - Chat Engineering Constraint Action Lock and Evidence

## Problem
- The AI assistant engineering constraint package action remained enabled after successful package generation.
- Repeated activation could write duplicate engineering constraint package and assistant action audit evidence.

## Impact
- Duplicate engineering constraint evidence can pollute BOM, routing, scheduling, OTD evidence, and audit replay.
- The affected path is user-critical because engineering constraints directly gate whether AI scheduling advice is executable.

## Resolution
- Added the engineering constraint action id to `completedActionIds` after package generation succeeds.
- Verified the existing completed-action guard blocks repeated execution.
- Added unit and Chromium evidence that the action is disabled after success.

## Status
- Resolved and verified with unit, focused Chromium e2e, and full frontend unit coverage.
