# 2026-06-23 Review: Equipment E2E auth entry closure

Scope:
- Stabilize the Equipment real-browser cluster discovered by the full frontend E2E timeout artifacts.

Findings fixed:
- Equipment E2E used a demo-like auth session without explicit offline-demo route entry, causing protected route auth cleanup and login/dashboard churn.
- The live-mock empty-list scenario initially mixed `offlineDemo=0` with the suite init script that rewrote demo tokens on navigation.

Evidence:
- Full frontend E2E attempt: `npm run test:e2e` timed out after 20 minutes before full-suite summary.
- Latest artifacts pointed to `tests/e2e/equipment.spec.ts` failures waiting for `.equipment-board`.
- Focused Equipment E2E after the fix: `npm run test:e2e -- tests/e2e/equipment.spec.ts` passed 22 Chromium tests.

Conclusion:
- Equipment is currently focused-green in real Chromium.
- Full frontend E2E remains unproven and must continue from the next artifact/red cluster after Equipment.
