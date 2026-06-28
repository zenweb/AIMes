# 2026-06-15 Review: Knowledge Citation Inventory Routing Coverage

## Result

PASS.

This slice strengthens evidence around AI assistant citation trust: which sources are attached, which questions stay under review, and how governance evidence propagates.

## Why This Slice

Knowledge citations are part of the existing AI assistant evidence chain. A regression here can make the assistant cite unrelated evidence or make the citation inventory disagree with direct question routing.

## Verified Contract

- Governance review evidence is consistently applied to the direct trace inventory list.
- Rush delay, CNC stoppage, and engineering-constraint traces receive the reviewed governance source when applicable.
- Top-risk order questions remain `需复核` and do not inherit unrelated CNC maintenance governance evidence.
- Unrelated assistant questions still do not fabricate citations.

## Evidence

- `npm run test:unit -- tests/unit/knowledge-citations.test.ts --reporter=dot`: 9 passed.
- `npm run test:unit:coverage -- tests/unit/knowledge-citations.test.ts --reporter=dot --coverage.reporter=json-summary`:
  - `src/utils/knowledge-citations.ts`: 86.36% lines, 85.1% statements, 65.55% branches, 100% functions.
- `npm run test:unit -- tests/unit/knowledge-citations.test.ts tests/unit/knowledge-governance-sync.test.ts tests/unit/quality-knowledge-sample-sync.test.ts --reporter=dot`: 40 passed.

## Boundary

This is a frontend citation utility evidence slice. It does not prove live LLM answer quality, backend knowledge retrieval, hosted CI, staging, gray observation, or full v1.0.0 release readiness.

