# 2026-06-15 Plan: purchase real browser material correction

## Success Criteria
- Real Chrome proves procurement recovery works through visible UI, not only unit tests.
- Evidence covers at least one supplier recovery path and one material anomaly correction path.
- Any environment limitation is recorded instead of hidden.

## Steps
1. Check Playwright E2E configuration and port behavior.
2. Avoid Docker-dependent smoke when the current shell cannot connect to Docker API.
3. Run focused Chromium E2E for supplier SLA selection.
4. Run focused Chromium E2E for material anomaly correction.
5. Record evidence and residual risk in the daily docs.

## Stop Condition
- Both focused browser slices pass, or a failing slice is converted into a TDD fix path.
