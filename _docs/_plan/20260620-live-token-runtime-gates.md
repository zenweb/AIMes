# 2026-06-20 Plan: Live token runtime gates

## Goal

Close the remaining high-impact runtime gates where stale offline-demo storage could block live backend writes or realtime monitoring after a real backend login.

## Steps

- [x] Scan direct `isOfflineDemoMode()` call sites.
- [x] Keep pure rendering/demo-hint decisions out of scope.
- [x] Migrate production operation commands to the token-aware rule.
- [x] Migrate Dashboard realtime connection to the token-aware rule.
- [x] Migrate Monitoring live/demo startup to the token-aware rule.
- [x] Treat missing latest Hypercare acceptance as an empty state.
- [x] Verify with focused tests, build, and real browser evidence.

## Success Criteria

- Real backend token cannot be downgraded to local production command results by stale offline-demo storage.
- Dashboard and Monitoring still connect realtime hubs when a real backend token exists.
- Missing optional Hypercare latest evidence does not render as an initialization failure.
