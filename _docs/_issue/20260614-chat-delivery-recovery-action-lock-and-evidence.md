# 2026-06-14 Issue - Chat Delivery Recovery Action Lock and Evidence

## Problem
- The AI assistant delivery recovery package action remained enabled after successful package generation.
- Repeated activation could write duplicate delivery recovery package and assistant action audit evidence.

## Impact
- Duplicate delivery recovery evidence can pollute scheduling handoff, risk queues, purchase / quality responsibility actions, OTD evidence, and audit replay.
- The affected path is user-critical because delivery recovery is a core release-readiness and OTD workflow.

## Resolution
- Added the delivery recovery action id to `completedActionIds` after package generation succeeds.
- Verified the existing completed-action guard blocks repeated execution.
- Added unit and Chromium evidence that the action is disabled after success.

## Status
- Resolved and verified with unit, focused Chromium e2e, and full frontend unit coverage.
