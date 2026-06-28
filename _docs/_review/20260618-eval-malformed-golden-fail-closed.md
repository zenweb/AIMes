# 2026-06-18 Eval Malformed Golden Fail Closed Review

## Decision

Accepted as a minimal hardening slice for the agent evaluation gate.

## What Changed

- `EvalScriptTests.cs` now includes a direct parse-failure regression test.
- The test writes invalid JSON into `golden_quality.json`, runs `eval.ps1`, and asserts the script exits non-zero with `Could not parse golden dataset`.

## Risk Review

- This is test-only hardening; it does not change runtime behavior of the evaluation script.
- The existing fail-closed branches for missing files and empty test cases remain intact and were revalidated.
- No unrelated production paths were modified.

## Verification Evidence

- Malformed golden dataset test passed.
- Evaluation test project passed with `3 passed`.
- Backend unit baseline remained green with `444 passed`.
