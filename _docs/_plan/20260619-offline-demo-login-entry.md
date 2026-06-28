# 2026-06-19 Plan: Offline demo login entry

## Success Criteria
- A user can open the local frontend preview login with an explicit demo-mode URL.
- `admin / admin123` enters the dashboard without requiring backend auth or password change.
- The behavior is covered by targeted unit tests and real browser evidence.

## Steps
1. Reproduce the failed assumption in auth store tests.
2. Update only the demo-login forced password-change flag.
3. Run auth/login/router regression.
4. Rebuild and restart the production preview on port 4173.
5. Verify the login path in a real browser and capture evidence.

## Result
- All success criteria met for the offline demo entry.
- Live backend authentication remains a separate verification track.
