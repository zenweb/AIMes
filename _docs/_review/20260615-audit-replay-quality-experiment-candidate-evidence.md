# 2026-06-15 Review - Audit Replay Quality Experiment Candidate Evidence

## Decision

The audit replay path now has explicit regression coverage for quality experiment candidate evidence.

## What changed

- Added a test that selects `质量实验候选` as the default replay chain when candidate records are present.
- The test pins the source rollback audit, evidence metrics, gap label, candidate trace, next action, and references.

## Why it matters

- This closes a user-critical audit replay hole where the quality experiment candidate branch was implemented but not directly regression-protected.
- The replay panel now has evidence coverage for both the quality recommendation feedback path and the experiment candidate path.

## Verification

- Targeted unit test passed.
- Related unit regression passed.
- Full frontend unit coverage passed at `111 files / 1004 tests passed`.
