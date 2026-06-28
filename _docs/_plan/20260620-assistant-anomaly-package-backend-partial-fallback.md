# 2026-06-20 Plan: Assistant Anomaly Package Backend Partial Fallback

## Goal
Prevent malformed or incomplete backend assistant anomaly disposition package evidence from replacing complete local anomaly disposition records.

## Success Criteria
- Backend anomaly package read failures can fail loud when requested.
- Non-array backend anomaly payloads produce a readable Chinese audit error in fail-loud mode.
- Incomplete backend anomaly records are ignored before merge.
- Complete local anomaly package evidence remains available when backend evidence is missing, malformed, or incomplete.
- Adjacent chat, anomaly dispatch, production anomaly, anomaly board, and audit replay behavior remains stable under targeted tests.

## Execution
1. Add RED tests for fail-loud backend errors, non-array backend payload, and partial backend anomaly package evidence.
2. Update `queryAssistantAnomalyPackages()` to accept fail-loud options.
3. Update `readAssistantAnomalyDispositionPackagesBackendFirst()` to validate array shape and filter records through `isAssistantAnomalyPackage`.
4. Run target and adjacent tests, lint, and diff checks.

## Status
- Completed for this slice on 2026-06-20.
- This does not mark the overall CC remediation or strict v1.0.0 goal complete.
