# 2026-06-14 Plan - Quality Knowledge Evidence API Contract Evidence

## Success Criteria
- Quality knowledge evidence reads call `/scheduling/quality-knowledge-evidence` with `evidenceType` and `take`.
- Evidence writes post the original envelope payload to the same backend contract path.
- Backend read errors propagate for higher-level fail-loud handling.
- Related quality knowledge workflow tests remain green.

## Execution
1. Read `qualityKnowledgeEvidence.ts` and immediate callers.
2. Add a focused API contract test.
3. Run focused test.
4. Run related quality knowledge regression.
5. Run focused coverage for the new slice.
6. Document changelog, review, todo, issue, and plan entries.

## Outcome
- Criteria met by unit tests and focused coverage.
- No production code change required.
