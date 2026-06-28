# Employee deactivate confirmation e2e evidence

- GeneratedAt: 2026-06-22T14:02:00+08:00
- Scope: Real-browser regression for the employee deactivate confirmation path.
- Boundary: focused e2e slice only; not a full frontend e2e suite.

## Change

- Added a Playwright scenario for the employee page:
  - open employee edit dialog,
  - click `离职`,
  - verify bilingual confirmation and contextual links,
  - click `取消离职`,
  - close the dialog,
  - verify the employee remains visible and is not marked inactive.

## Verification

```text
npm run test:e2e -- tests/e2e/employee.spec.ts -g "员工离职需要先展示确认提示"

Running 1 test using 1 worker
ok 1 [chromium] › tests/e2e/employee.spec.ts › Employee 人员能力约束 › 员工离职需要先展示确认提示且取消后不改变在职状态
1 passed
Exit code: 0
```

## Result

PASS. The employee deactivate confirmation now has browser-level regression coverage through the production build + preview e2e path.

