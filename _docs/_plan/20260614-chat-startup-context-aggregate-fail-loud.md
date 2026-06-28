# 2026-06-14 Plan - Chat Startup Context Aggregate Fail-Loud

## Objective
- Harden the existing AI assistant startup workflow so multiple context sync failures are visible without flooding the chat with repeated alerts.

## Success Criteria
- Add a failing unit test first for simultaneous startup context failures.
- Prove the current implementation renders multiple alerts.
- Add the minimum production fix in `ChatPanel.vue`.
- Verify the assistant input remains usable.
- Add real-browser evidence for the same failure mode.
- Run focused and broad verification.

## Execution
- Added one unit regression test in `src/frontend/tests/unit/chat-panel.test.ts`.
- Confirmed RED: three startup context failures produced three alert messages.
- Added startup context failure accumulation and a single flush point in `ChatPanel.vue`.
- Added one Chromium scenario in `src/frontend/tests/e2e/chat.spec.ts`.
- Ran focused unit, full ChatPanel unit, focused coverage, focused Chromium, full chat Chromium, and full frontend unit coverage.

## Stop Condition
- Stop this startup context aggregation subpath for now; it has both unit and real-browser evidence.
- Continue with the next highest-leverage existing feature slice.
- Gray observation / 15-day monitoring remains deferred by owner instruction.
