# Employee Filter Search Evidence - 2026-06-22

## Scope

- Feature: Employee board filtering and search.
- Slice: Real-browser coverage for role/team filters, search, inactive visibility, and inactive read-only detail.
- User value: Operators can narrow the roster without accidentally mixing active and inactive employees.

## Evidence

- Added Playwright coverage:
  - `src/frontend/tests/e2e/employee.spec.ts`
  - Test: `员工筛选搜索会区分班组角色与离职可见性`
- Verified command:
  - `npm run test:e2e -- tests/e2e/employee.spec.ts -g "员工筛选搜索"`
- Result:
  - `1 passed`

## Assertions

- Role filter `Operator` and team filter `乙班` show active matching employees.
- Inactive employee `EMP-008 吴十` is hidden until `显示离职` is checked.
- Search `EMP-008` narrows the list to the inactive employee after inactive visibility is enabled.
- Inactive employee detail opens as `员工详情`.
- Inactive detail does not expose save or deactivate actions.

## Implementation Note

No production code change was required. The current implementation already matched the expected filtering and inactive read-only behavior; this slice promotes the behavior from unit-only coverage to browser-level evidence.

## Residual Risk

- This slice covers the default offline-demo roster. Backend-specific filter payloads are still covered by the loaded roster behavior rather than by a live backend matrix.
