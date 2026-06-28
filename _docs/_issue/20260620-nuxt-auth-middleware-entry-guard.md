# 2026-06-20 Issue - Nuxt auth middleware entry guard

## Issue
Nuxt global auth middleware did not fully match the app router auth semantics.

## Impact
- Blank token strings could be treated as authenticated in Nuxt middleware.
- Cached users without a valid role could reach role handling and redirect to dashboard instead of login.
- Roles with harmless surrounding whitespace could be rejected even though the Vue router guard accepts normalized roles.

## Resolution
- Replaced local middleware parsing with the shared local auth utilities already used by the Vue router.

## Verification
- Added failing tests first, then implemented the middleware fix.
- Focused auth tests and adjacent frontend tests pass.
- Production build passes.
