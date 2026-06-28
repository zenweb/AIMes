# 2026-06-20 Todo - Nuxt auth middleware entry guard next actions

## Done
- Locked Nuxt auth middleware behavior for blank tokens, incomplete cached users, and normalized roles.
- Verified auth guard parity with focused tests and production build.

## Next
- Re-run frontend coverage and pick the next lowest-coverage user-critical path.
- Prefer paths that are both route-entry critical and still below the current coverage median.
