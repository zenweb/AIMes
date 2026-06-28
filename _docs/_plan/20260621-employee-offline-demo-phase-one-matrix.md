# Plan: Employee Offline Demo Phase-One Matrix Link

## Goal
Make the Employee offline-demo real-browser evidence discoverable from the phase-one Sprint 0 audit matrix.

## Steps
1. Add a RED architecture guard requiring the matrix to cite the Employee offline-demo evidence.
2. Update the matrix source list and Sprint 0 acceptance table.
3. Keep the row scoped to offline-demo frontend evidence and explicitly exclude hosted CI, staging, and gray observation.
4. Run the focused matrix guard.
5. Re-run the bounded Employee offline-demo evidence script.

## Status
- Completed on 2026-06-21.

## Stop Condition
- The focused matrix guard passes and the Employee offline-demo evidence report remains `Result: PASS`.

## Verification
- Focused matrix guard: PASS, 1/1.
- Employee offline-demo evidence script: PASS, unit 35/35 and Chromium 1/1.
