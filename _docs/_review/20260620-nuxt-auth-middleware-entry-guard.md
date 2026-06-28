# 2026-06-20 Review - Nuxt auth middleware entry guard

## Scope
- User-critical route entry behavior for the Nuxt scheduling preview.
- Focused on consistency with the existing Vue router guard.

## Findings
- No open findings for this slice.
- The previous Nuxt middleware accepted blank token strings and could diverge from router guard behavior for incomplete cached users and whitespace-padded roles.

## Resolution
- Reused the existing local auth utilities instead of keeping a second parser in middleware.
- Added regression tests for blank token, missing role, and normalized role authorization.

## Evidence
- Focused auth guard tests passed.
- Adjacent login, employee, offline-demo, and proxy guard tests passed.
- Production Nuxt build passed.
