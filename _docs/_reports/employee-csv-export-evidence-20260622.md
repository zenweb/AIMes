# Employee CSV Export Evidence - 2026-06-22

## Scope

- Feature: Employee board CSV export.
- Slice: Real-browser evidence for the existing `导出 CSV` workflow.
- User value: Exported roster must preserve employee identity, role/team/shift, contact fields, and active/inactive status evidence.

## Evidence

- Added Playwright coverage:
  - `src/frontend/tests/e2e/employee.spec.ts`
  - Test: `导出员工 CSV 包含完整名册与在职状态证据`
- Verified command:
  - `npm run test:e2e -- tests/e2e/employee.spec.ts -g "导出员工 CSV"`
- Result:
  - `1 passed`

## Assertions

- Download filename is `员工列表.csv`.
- Header contains `工号,姓名,角色,班组,班次,电话,邮箱,在职`.
- Active employee evidence includes `EMP-001,张三,Operator,甲班,Day,13800138001,,是`.
- Inactive employee evidence includes `EMP-008,吴十,Operator,乙班,Night,,,否`.

## Implementation Note

No production code change was required. The current export implementation already downloads the complete employee roster, including inactive status evidence. This slice adds browser-level regression coverage for that user-facing behavior.

## Residual Risk

- This slice verifies offline-demo roster export in Chromium. Live backend export remains covered indirectly by the same UI path once employee data is loaded from the backend.
