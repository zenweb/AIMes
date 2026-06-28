# 2026-06-19 Knowledge Governance Backend Partial Fallback

## Changed
- Hardened `readKnowledgeGovernanceReviewsBackendFirst` so incomplete backend governance review records cannot replace complete local review evidence.
- Added regression coverage for partial backend governance arrays.

## Verification
- RED: `npm run test:unit -- tests/unit/knowledge-governance-sync.test.ts` failed on the partial backend governance review case before implementation.
- GREEN: `npm run test:unit -- tests/unit/knowledge-governance-sync.test.ts` passed: 8 tests.
- GREEN: `npm run test:unit -- tests/unit/knowledge-governance-evidence-api.test.ts` passed: 2 tests.
- GREEN filtered adjacency: `admin-board.test.ts -t "知识|knowledge governance|governance"` passed: 7 selected, 25 skipped.
- GREEN filtered adjacency: `audit-decision-replay-panel.test.ts -t "知识|knowledge governance|governance"` passed: 4 selected, 56 skipped.
- GREEN filtered adjacency: `document-upload.test.ts -t "知识治理|knowledge governance|governance|help"` passed: 7 selected, 30 skipped.
- GREEN: `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts` passed: 9 tests.
- GREEN: `npm run lint -- src/utils/knowledge-governance-sync.ts tests/unit/knowledge-governance-sync.test.ts tests/unit/knowledge-governance-evidence-api.test.ts`.
- GREEN: `git diff --check -- src/frontend/src/utils/knowledge-governance-sync.ts src/frontend/tests/unit/knowledge-governance-sync.test.ts` reported only CRLF normalization warnings.
