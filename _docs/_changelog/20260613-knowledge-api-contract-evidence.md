# 2026-06-13 Changelog: Knowledge API contract evidence

## Changed

- Added unit contract evidence for `src/api/knowledge.ts`.
- Covered knowledge query, chat history, and multipart document upload.
- No production code was changed; the existing API helper already matched the expected backend contract.

## Verification

- `npm run test:unit -- tests/unit/knowledge-api.test.ts` => 2 passed.
- `npm run test:unit -- tests/unit/knowledge-api.test.ts tests/unit/chat-panel.test.ts tests/unit/document-upload.test.ts` => 67 passed.
- `npm run test:unit:coverage -- tests/unit/knowledge-api.test.ts` => `knowledge.ts` line coverage 100%.

