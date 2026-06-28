# 2026-06-22 Issue: Agent E2E regression fix isolated from dirty main tree

Problem:
- Scheduling Agent E2E tests needed a live-backend-style entry for backend API scenarios.
- The main worktree already has mixed staged/unstaged changes in `src/frontend/tests/e2e/scheduling.spec.ts`, so applying the fix directly there would risk mixing unrelated changes into the staged release candidate.

Root cause:
- The Agent backend API tests were forcing live backend behavior after page load through reload/evaluate patterns, creating navigation races and allowing unrelated scheduling startup APIs to interfere.

Resolution in clean worktree:
- Detect targeted Agent backend mock test titles in `scripts/e2e.mjs` and set `VITE_OFFLINE_DEMO=false` for those runs.
- Enter Scheduling with `scheduling?offlineDemo=0` for Agent backend mock tests.
- Mock non-Agent scheduling startup APIs before navigation while letting `/scheduling/agent/recommend` and `/adopt` be handled by the Agent API mock.
- Remove reload/evaluate patterns that raced with navigation.

Current status:
- Verified patch exists at `tmp/agent-e2e-slice-20260622.patch`.
- Main tree integration is intentionally deferred until the staged labor retry candidate is committed, replaced, or explicitly opened for merge.
