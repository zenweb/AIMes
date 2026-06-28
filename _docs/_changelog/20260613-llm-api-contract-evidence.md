# 2026-06-13 Changelog: LLM API contract evidence

## Changed

- Added unit contract evidence for `src/api/llm.ts`.
- Covered LLM status and config endpoint helpers.
- No production code was changed; the existing helper already matched the expected backend contract.

## Verification

- `npm run test:unit -- tests/unit/llm-api.test.ts` => 2 passed.
- `npm run test:unit -- tests/unit/llm-api.test.ts tests/unit/chat-panel.test.ts` => 41 passed.
- `npm run test:unit:coverage -- tests/unit/llm-api.test.ts` => focused summary 100% statements and 100% lines.

## Note

The focused V8 coverage table did not print the `llm.ts` filename, but the summary reports 4/4 covered statements and 2/2 covered functions for this focused helper run.

