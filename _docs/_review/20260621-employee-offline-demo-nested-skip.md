# Review: Employee Offline Demo Nested Skip

## Scope
- Frontend offline-demo error classification only.
- No Employee CRUD behavior, backend endpoint, auth rule, or routing expansion was changed.

## Findings
- Current EmployeeBoard already suppresses direct offline demo skip errors and wrapped message strings.
- The missing case was a request layer preserving the original offline skip as a nested error object.
- A bounded recursive classifier fixes that root cause without changing ordinary network/backend failure visibility.

## Verification
- Unit tests passed: 35/35 across `offline-demo-mode.test.ts` and `employee-board.test.ts`.
- Independent Nuxt production build passed into `tmp/employee-preview-output`.
- Real browser check on port 4174 confirmed no `员工列表加载失败` alert and no `Offline demo mode skipped backend request` text.

## Residual Risk
- The already-running `4173` preview service was not restarted in this slice, to avoid disrupting the user's current tab.
- If a browser still shows the old message on `4173`, refresh the deployed preview bundle or use the verified `4174` preview.

