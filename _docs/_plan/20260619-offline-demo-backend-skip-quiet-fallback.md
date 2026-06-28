# 2026-06-19 Plan: Offline demo backend-skip quiet fallback

## Success Criteria
- Offline demo employee page displays local sample employees without technical backend-skip alerts.
- Offline demo document upload page does not display quality knowledge or customer order import backend-skip failures.
- Real backend failures remain visible outside the intentional offline skip path.
- Targeted unit tests, production build, and real-browser checks pass.

## Execution
1. Reproduce the user-visible backend-skip symptom on the affected page.
2. Add focused tests that distinguish `OfflineDemoApiError` from ordinary backend failures.
3. Quiet only the intentional offline-demo skip path.
4. Run targeted regression and production build.
5. Restart the 4173 preview and verify with a real browser.

## Result
- Success criteria met for the targeted offline-demo backend-skip leak.
- Remaining release blockers are outside this slice: first gray release start and two-week no P0/P1 observation evidence.
