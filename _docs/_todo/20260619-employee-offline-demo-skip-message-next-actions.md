# 2026-06-19 Todo - Employee Offline Demo Skip Message

## Next Actions
- When verifying with the browser in live mode, use `?offlineDemo=false` or clear `localStorage.aimes_offline_demo` so requests reach `/api/v1/employee`.
- If the employee page still falls back in live mode, inspect backend status, token state, and `/api/v1/employee` response before changing UI code.
- Restore Nuxt dev/preview mounting for real browser evidence; current blocker is `No entry found in rollupOptions.input`.
- Continue the backend-first evidence reader audit after this employee list UX defect is closed.
