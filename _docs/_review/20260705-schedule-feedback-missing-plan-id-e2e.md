# 2026-07-05 Schedule Feedback Missing Plan ID E2E Review

## Decision

`PASS_EXISTING_FEATURE_HARDENING`

The Scheduling rush-order adoption feedback path now has real-browser evidence for the fail-loud behavior when the current schedule plan is missing its ID.

## Scope

- Surface: `/scheduling/scheduling?offlineDemo=0`
- User action: generate and adopt the `WO-RUSH-9001 客户插单` Agent suggestion.
- Test file: `src/frontend/tests/e2e/scheduling.spec.ts`
- Mocked backend condition: `/api/v1/scheduling/current` returns a plan with `id: ""`.

## Result

- Added a Playwright E2E for `急单采纳反馈缺少计划 ID 时真实浏览器 fail-loud`.
- The test verifies:
  - rush-order adoption still writes a local feedback record;
  - the operator-facing sync note has `role="status"` and `aria-live="polite"`;
  - the sync note includes `反馈已写入本地复盘记录`;
  - the sync note includes `当前排产计划缺少 ID`;
  - the sync note includes `暂未同步后台`;
  - the sync note includes `尚未写入正式排产计划`;
  - `/api/v1/scheduling/adoption-feedback` is not called when the plan ID is missing.

## Verification

```text
npm run lint -- tests/e2e/scheduling.spec.ts
Result: PASS

git diff --check -- src/frontend/tests/e2e/scheduling.spec.ts
Result: PASS

npm run test:e2e -- --grep "急单采纳反馈缺少计划 ID 时真实浏览器 fail-loud"
Result: 1 passed
```

## Boundary

- This is frontend browser evidence for an existing Scheduling fail-loud path.
- It does not change production code.
- It does not close the separate double-click task detail browser evidence, which remains blocked by `_docs/_issue/20260705-schedule-task-detail-dblclick-browser-evidence-blocked.md`.
- It does not change the release-gate status. Strict final v1.0.0 still requires gray observation `P0=0` / `P1=0` monitoring evidence.
