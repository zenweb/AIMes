# 2026-06-20 Nuxt auth middleware entry guard

## Changed
- Aligned `middleware/auth.global.ts` with the Vue router auth guard by reusing:
  - `getLocalAccessToken`
  - `getLocalUser`
  - `getLocalUserRole`
- Blank access tokens are now treated as unauthenticated.
- Incomplete cached users are now treated as unauthenticated before role checks.
- Cached roles are normalized before role-restricted route authorization.

## Verified
- `npm run test:unit -- tests/unit/nuxt-auth-middleware.test.ts tests/unit/router-auth.test.ts`
- `npm run test:unit -- tests/unit/nuxt-auth-middleware.test.ts tests/unit/router-auth.test.ts tests/unit/nuxt-config.test.ts tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/auth.store.test.ts`
- `npm run build`
