# 2026-06-15 Feedback Form Adoption Submit Evidence Plan

## Goal

Improve evidence depth for the existing scheduling adoption feedback dialog.

## Success Criteria

1. Empty reason category cannot submit feedback.
2. Successful submit sends all scheduling feedback evidence fields.
3. Successful backend write emits `submitted`.
4. Cancel emits `close` without backend writes.
5. Focused component line coverage is no longer a low-coverage hotspot.

## Result

- `feedback-form.test.ts`: 4/4 passed.
- `FeedbackForm.vue` focused line coverage: 92.85%.

