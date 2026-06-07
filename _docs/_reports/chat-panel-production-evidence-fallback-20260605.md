# 2026-06-05 ChatPanel Production Evidence Fallback

## Scope

- Target: `ChatPanel.vue` AI 生产助手业务问答 fallback.
- User path verified: AI 生产助手 / 生产完工、生产复核、生产异常证据链解释.
- Boundary: frontend quality evidence only; this does not close release B-track gates.

## Change

- Added unit coverage proving that when RAG/knowledge query fails, the assistant reads the latest OTD production execution evidence instead of returning a generic demo answer.
- Covered latest `生产完工` + `生产复核` evidence selection and trace rendering.
- Covered `生产异常` evidence selection with source trace rendering and governance wording.
- No production application code changed.

## Verification

- Command: `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - Result: PASS
  - Tests: `37 passed`
- Command: `npm run test:unit:coverage`
  - Result: PASS
  - Test files: `84 passed`
  - Tests: `509 passed`
- Command: `npm run test:e2e -- chat.spec.ts`
  - Result: PASS
  - Browser: Chromium
  - Tests: `32 passed`

## Coverage Delta

- Global lines: `77.25% -> 77.41%`
- Global statements: `73.62% -> 73.78%`
- Global functions: `66.69% -> 66.84%`
- Global branches: `56.61% -> 56.77%`
- `ChatPanel.vue` lines: `64.18% -> 66.72%`
- `ChatPanel.vue` statements: `63.54% -> 66.33%`
- `ChatPanel.vue` functions: `58.26% -> 61.73%`
- `ChatPanel.vue` branches: `61.37% -> 63.65%`

## Release Gate Impact

- Improves AI assistant correctness evidence for production execution explanations.
- Does not close hosted CI, PostgreSQL/staging, attack-chain A/B/C, security signoff, first gray deployment, or observation-window gates.
