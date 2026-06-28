# Employee Mobile Modal Evidence - 2026-06-22

## Scope

- Feature: Employee board modal workflows.
- Slice: Mobile-width real-browser coverage for edit/create dialogs and deactivate confirmation.
- Core principles covered:
  - Multilingual guidance remains visible in complex operations.
  - Related production, scheduling, audit, and help links remain present.
  - Modal content stays inside a 390px mobile viewport.

## Evidence

- Added Playwright coverage:
  - `src/frontend/tests/e2e/employee.spec.ts`
  - Test: `员工移动端弹窗保持在视口内并保留操作提示`
- Verified command:
  - `npm run test:e2e -- tests/e2e/employee.spec.ts -g "员工移动端弹窗"`
- Result:
  - `1 passed`

## Observed Behavior

- Edit dialog opens on mobile width and remains inside the viewport.
- Edit guidance includes English support text.
- Deactivate confirmation appears before the irreversible action.
- Deactivate cancel action remains visible and usable.
- Create dialog opens on mobile width and remains inside the viewport.
- Create guidance includes English support text.
- Create action remains visible.

## Implementation Note

No EmployeeBoard CSS change was needed in this slice. The focused real-browser test passed against the current production build path, so the evidence was captured as a regression guard instead of adding unnecessary layout churn.

## Residual Risk

- This slice covers Chromium at 390x844. Additional device widths can be added later if a release audit requires broader mobile matrix evidence.
