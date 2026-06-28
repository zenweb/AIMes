# 2026-06-15 Feedback Form Adoption Submit Evidence

## Change

- Added focused tests for `FeedbackForm.vue`, the scheduling adoption feedback dialog.
- Locked the existing planner feedback path:
  - submit remains disabled until a reason category is selected.
  - successful submit sends plan, workshop, objective, reason category/detail, moved order ids, and AI trace id.
  - successful backend write emits `submitted`.
  - cancel closes the dialog without writing backend feedback.

## Evidence

```powershell
npm run test:unit -- tests/unit/feedback-form.test.ts
# 1 file passed, 4 tests passed

npm run test:unit:coverage -- tests/unit/feedback-form.test.ts --coverage.include=src/components/gantt/FeedbackForm.vue
# FeedbackForm.vue lines 92.85%, branches 93.54%, functions 71.42%, statements 89.65%
```

