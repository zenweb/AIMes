# 2026-06-22 Employee Pagination Live Mock

## Changed

- Added employee pagination live mock E2E coverage for a 25-person employee list.
- Mocked global notification negotiation and generic API evidence requests for this live mock path.
- Added a fail-loud 401 assertion before pagination interaction to prevent hidden auth redirects.
- Relaxed the offline recovery link assertion to accept the production build's relative base href while preserving the login target and employee redirect intent.

## Verified

- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "员工分页"`
- `npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线员工页提供切换在线后端入口"`
- `npm run test:e2e -- tests/e2e/employee.spec.ts` (19 passed, 1 skipped)
- `npm run test:unit -- tests/unit/employee-board.test.ts`
- `npm run build`
