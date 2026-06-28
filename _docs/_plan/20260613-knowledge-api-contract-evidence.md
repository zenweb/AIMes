# 2026-06-13 Plan: Knowledge API contract evidence

## Success criteria

- Move to a low-coverage user-critical path after notification hardening.
- Prefer a 0-coverage helper used by visible workflows.
- Strengthen evidence without expanding scope.

## Result

- Selected `src/api/knowledge.ts` because it supports chat and document upload and had no direct coverage.
- Added focused contract tests for all exported helper functions.
- Verified chat and document upload regressions.

