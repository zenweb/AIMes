# 2026-06-20 Plan - Nuxt auth middleware entry guard

## Goal
Harden the existing authenticated entry path before expanding scope.

## Selection signal
- `middleware/auth.global.ts` was the lowest-covered frontend source in the current coverage summary:
  - lines: 53.57%
  - branches: 22.58%
- The file controls user-critical protected route entry.

## Steps
1. Compare Nuxt middleware behavior with the existing Vue router guard.
2. Add failing tests for the observed divergence.
3. Reuse shared auth utilities in the Nuxt middleware.
4. Run focused and adjacent regression tests.
5. Run production build.

## Status
- Completed for this slice.
