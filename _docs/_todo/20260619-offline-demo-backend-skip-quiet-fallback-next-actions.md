# 2026-06-19 TODO: Offline demo backend-skip quiet fallback next actions

## Next
- Continue real-browser traversal of offline demo user-critical paths and record any remaining technical backend-skip leaks.
- If another leak appears, add a focused RED test for that specific sync/component boundary before changing production code.
- Keep ordinary backend failures fail-loud; only intentional `OfflineDemoApiError` paths should be quiet in offline demo mode.

## Suggested Routes
- `/scheduling/dashboard?offlineDemo=1`
- `/scheduling/employee?offlineDemo=1`
- `/scheduling/knowledge/documents?offlineDemo=1`
- `/scheduling/report?offlineDemo=1`

## Stop Condition
- Offline demo routes show business-friendly sample/empty states, and no user-facing text contains `Offline demo mode skipped backend request`.
