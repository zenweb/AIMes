# 2026-06-15 Audit Replay Quality Experiment Candidate Evidence Issue

## Issue

The audit replay panel had an implemented quality experiment candidate branch but no direct regression test for the candidate evidence chain.

## Risk

- Default replay selection could regress away from the quality experiment candidate path.
- Candidate evidence fields could drift without a focused assertion set.
- Quality decision evidence would look covered while the actual branch remained weakly protected.

## Resolution

- Add a focused regression test that pins the candidate replay chain and its evidence fields.
- Confirm the existing production mapping already satisfies the expected behavior.
