# 2026-06-15 chat Hypercare governance entry coverage issue

## Issue

`ChatPanel.vue` was the lowest line-covered component after the audit replay slice. Existing tests covered many assistant actions, but the rollout acceptance / Hypercare / Agent governance navigation intent was not explicitly protected.

## Impact

An operator could lose the intended path from AI assistant to rollout acceptance monitoring and Agent governance without a focused regression test catching duplicated or missing action buttons.

## Resolution

Added a test that confirms the assistant surfaces:

- production overview;
- realtime monitoring;
- system governance;
- no duplicate realtime-monitoring action for the combined Hypercare/governance intent.
