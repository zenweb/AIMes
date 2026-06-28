# 2026-06-22 Todo: Employee live login database credential recovery next actions

- Keep using `http://127.0.0.1:4173/scheduling/login?offlineDemo=0` for live backend verification.
- Use local live credentials:
  - `admin / admin123`
  - `operator1 / operator123`
- If the employee page shows offline demo skip again, first clear `localStorage.aimes_offline_demo` or open with `?offlineDemo=0`.
- If login fails again, inspect `system_users` before trying more passwords.
- Treat a page showing nine employee cards including `EMP-006`/`EMP-009` as fallback fixture evidence; the current live backend seed returns three employee rows.
