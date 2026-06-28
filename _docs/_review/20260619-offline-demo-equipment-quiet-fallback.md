# 2026-06-19 Review - Offline Demo Equipment Quiet Fallback

## Scope
- Reviewed only the EquipmentBoard offline-demo skip behavior for equipment list and statistics loading.
- Existing unrelated EquipmentBoard changes in the dirty worktree were not reverted or reworked.

## Findings
- No blocking findings in this slice.
- The implementation only suppresses UI alerts when `isOfflineDemoError(error)` is true.
- Ordinary backend failures remain covered by existing fail-loud tests for equipment list and statistics fallback alerts.

## Residual Risk
- Browser verification required seeding the local demo auth state because unauthenticated navigation from `/scheduling/equipment?offlineDemo=1` redirects to `/scheduling/login` without preserving `offlineDemo=1`.
- That redirect/query behavior is tracked separately as an issue and was not fixed in this EquipmentBoard slice.

## Verification
- EquipmentBoard unit suite: 17 passed.
- Offline demo regression package: 410 passed.
- Production build: passed.
- Real browser DOM evidence confirms no backend-skip text or equipment fallback alert on the Equipment page.
