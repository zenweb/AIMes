# 2026-06-19 Todo: Offline demo login entry next actions

## Done
- Demo login no longer forces the password-change page.
- Real browser evidence confirms `admin / admin123` reaches the dashboard in offline demo mode.

## Next
- Add a visible login-page affordance or docs link that distinguishes offline demo credentials from live backend credentials.
- Recheck live backend authentication separately once the API and database seed are intentionally running.
- Keep `/scheduling/login?offlineDemo=1` as the recommended local preview entry when backend availability is not part of the test.
