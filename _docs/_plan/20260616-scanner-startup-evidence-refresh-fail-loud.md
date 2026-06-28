# 2026-06-16 Scanner Startup Evidence Refresh Fail Loud Plan

## Goal

Make scanner startup evidence refresh fail loud while preserving locally available scan evidence.

## Success Criteria

- Backend evidence refresh failure during mount does not create an unhandled rejection.
- Local scan evidence loaded before mount remains visible.
- The operator sees the backend refresh failure reason.
- Targeted Scanner unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Re-baselined ScannerBoard targeted coverage.
2. Read scan evidence initialization and startup refresh logic.
3. Added a failing regression test for backend startup refresh failure.
4. Implemented a minimal `try/catch` around startup backend refresh.
5. Preserved startup evidence warning through the subsequent manual scan.
6. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value. Scanner still has uncovered camera lifecycle branches, but any next slice should start from a fresh baseline and a concrete workflow risk.
