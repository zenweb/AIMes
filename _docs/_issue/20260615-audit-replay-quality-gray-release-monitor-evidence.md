# 2026-06-15 Audit Replay Quality Gray Release Monitor Evidence Issue

## Issue

The audit replay panel had an implemented quality gray release monitoring branch but no direct regression test for the monitoring evidence chain.

## Risk

- Default replay selection could regress away from the gray release monitor branch.
- Monitor evidence fields could drift without a focused assertion set.
- Quality gray release evidence would look covered while the actual branch remained weakly protected.

## Resolution

- Add a focused regression test that pins the monitor replay chain and its evidence fields.
- Confirm the existing production mapping already satisfies the expected behavior.
