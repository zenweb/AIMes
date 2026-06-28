# 2026-06-15 Review - Audit Replay Quality Gray Release Monitor Evidence

## Decision

The audit replay path now has explicit regression coverage for quality gray release monitoring evidence.

## What changed

- Added a test that selects `质量灰度发布` as the default replay chain when monitor records are present.
- The test pins the republish cycle label, release audit, scope, version strategy, monitoring metrics, and active recovery semantics.

## Why it matters

- This closes another user-critical audit replay hole in the quality knowledge path.
- The replay panel now has direct regression evidence for candidate replay and gray release monitoring replay.

## Verification

- Targeted unit test passed.
- Related unit regression passed.
- Full frontend unit coverage passed at `111 files / 1005 tests passed`.

## Validation Note

- A parallel coverage run initially collided on Vitest's shared coverage temp directory.
- The failure was environmental, not behavioral.
- Re-running the full coverage command alone passed cleanly.
