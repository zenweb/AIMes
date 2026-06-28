# 2026-06-15 Feedback Form Adoption Submit Evidence Issue

## Issue

`FeedbackForm.vue` previously had coverage for backend submission failure, but thinner evidence for the successful adoption feedback path and validation guard.

## Impact

- A regression could drop schedule plan id, moved order ids, AI trace id, or reason detail from the feedback payload.
- A regression could allow an empty-category feedback write or write backend feedback when the user only cancels the dialog.

## Resolution

- Added tests for disabled submit before category selection, successful payload submission, `submitted` event emission, and cancel without backend write.

