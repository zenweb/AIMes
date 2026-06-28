# 2026-06-13 Plan: LLM API contract evidence

## Success criteria

- Continue from the 0-coverage API helper route after `knowledge.ts`.
- Strengthen a helper used by the visible chat workflow.
- Keep the slice limited to contract evidence unless tests expose a defect.

## Result

- Selected `src/api/llm.ts` because chat model status depends on it and it had no direct coverage.
- Added tests for `getLlmStatus` and `getLlmConfig`.
- Verified the target helper and chat panel regression.

