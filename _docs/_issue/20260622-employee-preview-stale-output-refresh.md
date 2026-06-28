# 2026-06-22 Issue - Employee Preview Served Stale Output

## Symptom

The Employee page still surfaced:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

## Cause

The active `4173` preview process was running `node ./scripts/preview.mjs` against `src/frontend/.output`, but `.output` was older than the focused E2E verification bundle.

Focused E2E uses `.output-e2e-*`, so a green E2E run does not update the user-accessible `4173` preview.

## Resolution

Rebuilt `.output` and restarted `4173`.

## Guardrail

When this symptom recurs, first check:

- `Get-CimInstance Win32_Process` for the `4173` process command line.
- `.output` timestamps.
- Whether the latest focused E2E used `.output-e2e-*` instead of refreshing `.output`.

Do not edit EmployeeBoard again unless current-bundle unit, E2E, or browser evidence turns red.
