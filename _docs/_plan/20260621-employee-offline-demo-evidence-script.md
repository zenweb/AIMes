# Plan: Employee Offline Demo Evidence Script

## Goal
Make the Employee offline-demo backend-skip regression independently rerunnable without depending on manual browser notes.

## Steps
1. Add a PowerShell evidence script that runs the focused unit and e2e checks.
2. Make the script fail loud with `Result: FAIL` and command exit codes.
3. Write the current report to `_docs/_reports/frontend-real-browser-employee-offline-demo-20260621-current.md`.
4. Add an architecture guard for the script and required bounded tokens.
5. Run the architecture guard and evidence script.

## Status
- Completed on 2026-06-21.

## Stop Condition
- Stop when the report contains `Result: PASS`, the unit tests pass 35/35, the focused Chromium e2e passes 1/1, and the architecture guard is green.
