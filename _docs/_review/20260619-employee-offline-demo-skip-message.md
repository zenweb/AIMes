# 2026-06-19 Review - Employee Offline Demo Skip Message

## Scope
- Reviewed the employee list fallback path for the visible alert: `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`.
- Root cause: some wrapped errors prefix the standard offline demo skip message, while `isOfflineDemoError` previously only accepted class, code, marker, name, or a message that started directly with the skip prefix.

## Findings
- No backend endpoint change was required. `/api/v1/employee` exists in `EmployeeEndpoints` and already has integration coverage.
- The fix is intentionally narrow: only messages containing the fixed `Offline demo mode skipped backend request:` marker are classified as expected offline demo skips.
- Real employee API failures still use the existing fail-loud alert path in `EmployeeBoard`.

## Residual Risk
- If a future wrapper rewrites the skip marker text instead of preserving it, it will still be treated as a real error and surfaced loudly.
- Browser evidence remains blocked by the current Nuxt dev startup issue: `No entry found in rollupOptions.input`.
