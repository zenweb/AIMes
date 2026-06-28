# 2026-06-14 Issue - Knowledge Governance Review Source Evidence

## Issue
- `knowledge-governance-sync.ts` had backend/local persistence tests but lacked direct unit evidence that an approved review changes the source document's operational status.
- Without that evidence, knowledge governance could appear stored while still leaving expired RAG documents in the pending queue.

## Resolution
- Added a focused test for applying approved review evidence to `CNC-01 主轴维护手册`.
- Verified the document becomes indexed, valid, audit-linked, reference-expanded, and removed from pending governance.

## Status
- Resolved for this slice.
- No production code change required.
