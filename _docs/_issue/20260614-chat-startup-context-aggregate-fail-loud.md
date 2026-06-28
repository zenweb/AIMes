# 2026-06-14 Issue - Chat Startup Context Aggregate Fail-Loud

## Status
- Fixed one UX/reliability issue in the AI assistant startup context sync path.

## Issue
- The assistant startup reads several context sources before the user asks a question.
- When multiple sources failed, each failure created its own alert message.
- The user-facing result was noisy: the chat area could be filled with repeated startup errors before the user interacted, even though the assistant input was still usable.

## Resolution
- Accumulate startup context failure messages while reading startup sources.
- Flush them once as a single assertive fail-loud alert after the startup context reads complete.
- Keep the chat input available and preserve offline/local-context answer fallback.

## Remaining Gaps
- Some low-frequency assistant action branches remain lower coverage.
- Future ChatPanel work should target distinct user-critical answer/action paths, not repeat the now-covered startup context aggregation path.
- Gray observation / 15-day monitoring is intentionally deferred by owner direction.
