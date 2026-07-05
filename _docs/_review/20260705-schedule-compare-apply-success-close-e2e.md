# 2026-07-05 Schedule Compare Apply Success Close E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling multi-objective comparison dialog now has real-browser evidence that applying the recommended plan closes the dialog, submits adoption feedback, and keeps the selected plan visible on the Schedule Board.

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- Component path: `ScheduleBoard` -> `ParetoCompare`
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Backend API mock paths:
  - `/api/v1/scheduling/optimize-compare`
  - `/api/v1/scheduling/optimize`
  - `/api/v1/scheduling/adoption-feedback`

## Result

- Added a Playwright E2E for `多目标方案对比采用成功后真实浏览器关闭对话框并同步反馈`.
- The test opens the multi-objective comparison dialog, applies the recommended `综合平衡` plan, and verifies:
  - the comparison dialog closes after apply;
  - exactly one adoption-feedback API request is sent;
  - the success sync note is visible;
  - the toolbar reflects the applied `综合平衡方案`;
  - the optimization warning remains visible.
- No production code changed because the existing apply handler already closes the dialog and submits feedback when the page is entered through the live-mock route.

## Debug Note

The first focused run failed because the test entered through `offlineDemo=1`; URL intent overrides `localStorage`, so the adoption-feedback request was intentionally skipped by offline demo mode. The test was corrected to use the live-mock route from page startup.

## Verification

```text
npm run test:e2e -- --grep "多目标方案对比采用成功后真实浏览器关闭对话框并同步反馈"
First run: failed, feedback request count stayed 0 because offlineDemo=1 skipped backend request.
Final run: 1 passed

npm run lint -- tests/e2e/scheduling.spec.ts
Result: PASS
```

## Boundary

- This is frontend quality hardening for an existing Scheduling workflow.
- It does not prove backend persistence beyond the browser request path and mocked 200 response.
- It does not change the release-gate status.
- Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` evidence.
