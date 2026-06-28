# Employee preview stale output recurrence

## Status

Resolved for the current local preview process.

## Symptom

The user again saw:

`员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`

on the Employee page.

## Finding

The current source and focused tests already suppress offline-demo backend-skip internals for Employee. The active `4173` process had been started before the latest verification cycle and was serving stale preview output risk.

## Current Evidence

- `npm run test:unit -- --run tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts`: 35/35 passed.
- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "backend skip"`: 2/2 passed.
- Rebuilt frontend `.output`, restarted `4173`, and verified real browser `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`: 8 employee cards, 0 alerts, no raw backend-skip text.

## Guardrail

If this symptom appears again, first check whether `4173` was restarted after `npm run build`. Do not edit EmployeeBoard again unless the focused tests or real browser current-bundle evidence turns red.
