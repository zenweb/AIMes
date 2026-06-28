# 2026-06-15 Changelog: Chat history and business-intent coverage

- Added ChatPanel coverage for restoring historical user/assistant messages when the panel becomes visible.
- Added send guards proving whitespace-only prompts and a second prompt during loading do not call the knowledge service.
- Added offline fallback coverage for user-critical business intents: BOM kitting impact, engineering change plus route capability entry points, top rush-order risks, and anomaly dispatch fail-loud guidance.
- Kept this as a test-only hardening slice; no production behavior was changed.

Verification:
- `npm run test:unit -- tests/unit/chat-panel.test.ts`: 63 passed.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts --coverage.include=src/components/chat/ChatPanel.vue --coverage.reporter=json-summary --coverage.reporter=text-summary`: passed.
- Focused ChatPanel coverage: statements 83.85%, branches 76.46%, functions 83.76%, lines 84.32%.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 918 tests passed; global lines 88.86%.
- Local backend/API evidence should continue to use `http://localhost:5002`; this slice did not use or reintroduce host port `5000`.
