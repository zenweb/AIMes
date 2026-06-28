# 2026-06-19 Plan - Employee Offline Demo Skip Message

## Goal
Stop the employee list from showing the internal offline demo backend skip error while preserving fail-loud behavior for real employee API failures.

## Steps
1. Reproduce and confirm current baseline around employee board and offline demo utilities.
2. Add a failing unit test for wrapped offline demo errors that preserve only the message.
3. Extend `isOfflineDemoError` with a fixed skip-marker check that survives HTTP wrapper prefixes.
4. Add employee board regression coverage for the wrapped skip message.
5. Re-run focused employee/offline demo tests and lint.

## Stop Condition
- Employee board still announces real API failures.
- Offline demo skip messages no longer appear in the employee list UI.
- Focused tests pass.
- Any missing browser evidence is reported explicitly instead of being counted as passed.
