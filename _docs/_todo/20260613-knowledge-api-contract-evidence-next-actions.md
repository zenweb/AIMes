# 2026-06-13 TODO: Knowledge API contract evidence next actions

- Continue selecting low-coverage, user-critical existing paths from the refreshed coverage report.
- Candidate next API helper: `src/api/llm.ts`, because chat status depends on it and it remains uncovered.
- Avoid further `knowledge.ts` work unless a new behavior defect appears; the helper now has focused contract coverage.

