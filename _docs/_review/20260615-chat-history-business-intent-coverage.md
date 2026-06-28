# 2026-06-15 Review: Chat history and business-intent coverage

Scope reviewed:
- `src/frontend/tests/unit/chat-panel.test.ts`

Findings:
- No production code was changed.
- The new tests cover core assistant reliability paths: restored history, empty prompt guard, duplicate-send guard while loading, and offline business guidance when RAG is unavailable.
- ChatPanel now clears the 80% focused line/function coverage threshold, so this component should not receive more coverage polishing unless a real defect appears.

Residual risk:
- This is component/unit evidence only; it does not replace real-browser assistant evidence.
- Gray observation remains intentionally out of scope for this slice and still depends on the separate release track.
- Historical reports may still mention `localhost:5000`; current runtime evidence should use `localhost:5002`.

Verification:
- Focused ChatPanel unit test: 63 passed.
- Focused ChatPanel coverage: statements 83.85%, branches 76.46%, functions 83.76%, lines 84.32%.
- Full frontend unit coverage: 111 files, 918 tests passed.
