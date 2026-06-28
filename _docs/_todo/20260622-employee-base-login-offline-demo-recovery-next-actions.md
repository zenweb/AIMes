# Next actions - Employee base login offline demo recovery - 2026-06-22

## Done
- Normalize `/scheduling/login` to `/login` inside Nuxt auth middleware authorization checks.
- Add a regression test for stale demo-session cleanup on base-prefixed online login.
- Verify backend login and employee list API with a live token.
- Verify the recovery path in a real browser through port 4173.
- Run focused employee + middleware unit tests.
- Run employee E2E tests.

## Remaining
- When the current unstaged work is packaged, include this slice with the existing employee live-backend recovery work.
- Before release packaging, rerun the full frontend unit suite from a clean slice boundary.
