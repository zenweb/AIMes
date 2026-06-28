# 2026-06-14 Chat Outsourcing Commitment Evidence

## Change
- Added focused ChatPanel evidence for the existing outsourcing commitment assistant workflow.
- Covered the fallback answer path when RAG is unavailable and a local outsourcing commitment package exists.
- Verified the assistant preserves delivery-accounting safeguards:
  - outsourcing commitment does not count as internal recovery;
  - vendor wait remains open until receipt and scheduling release are audited;
  - purchase, scheduling, report, governance, and audit replay actions remain available.

## Evidence
- `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - 1 file passed.
  - 40 tests passed.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts`
  - `src/components/chat/ChatPanel.vue`: statements 68.80%, branches 65.34%, functions 63.47%, lines 69.25%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 667 tests passed.
  - global statements 78.24%, branches 63.15%, functions 73.92%, lines 81.87%.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "供应延期升级后锁定替代供应商并进入排产复核和审计"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- No production code change was required; existing assistant behavior already supported this path.
- Gray observation remains skipped/deferred by owner direction and is not used as a blocker for this work item.
