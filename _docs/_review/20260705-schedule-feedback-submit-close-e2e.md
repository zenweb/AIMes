# 2026-07-05 Schedule Feedback Submit Close E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling feedback modal now has real-browser evidence that a successful adoption-feedback submission closes the form and leaves the Schedule Board usable.

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- Component path: `ScheduleBoard` -> `GanttToolbar` -> `FeedbackForm`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Backend API mock path: `/api/v1/scheduling/adoption-feedback`

## Result

- Added a Playwright E2E for `排产采纳反馈表单提交成功后关闭`.
- The test opens the toolbar feedback form, selects a required reason category, fills detail text, submits to the mocked backend, and verifies:
  - exactly one feedback API request is sent;
  - the feedback modal is hidden after success;
  - the Schedule Board remains visible.
- No production code changed because the existing component behavior already closes on the `submitted` event.

## Verification

```text
npm run test:e2e -- --grep "排产采纳反馈表单提交成功后关闭"
Result: 1 passed

npm run lint -- tests/e2e/scheduling.spec.ts
Result: PASS

GitHub Actions for commit 4032300ac314e3d196bd2621ebb7f90bad577da6
CI: success (run 28723661912)
Agent Evaluation: success (run 28723661918)
```

## Boundary

- This is frontend quality hardening for an existing Scheduling workflow.
- It does not prove the backend persistence semantics beyond the browser request/close path.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence.
