# 2026-06-18 Eval Malformed Golden Fail Closed Plan

## Goal

Add direct evidence that the evaluation script fails closed when a golden dataset is malformed, not only when it is missing or empty.

## Success Criteria

- `EvalScriptTests` includes a malformed-JSON regression test.
- The test proves the script exits non-zero on parse failure.
- The test proves the output contains `Could not parse golden dataset`.
- Existing evaluation tests still pass.
- No production code changes are required for this slice.

## Resume Plan

1. Read `src/tests/MES.Tests.Evaluation/eval.ps1` and `src/tests/MES.Tests.Evaluation/EvalScriptTests.cs`.
2. Add one malformed-JSON regression test.
3. Run the targeted evaluation test and confirm it fails before the change, then passes after the change.
4. Run the full evaluation test project.
5. Run the backend unit baseline as a no-regression check.

## Stop Condition

This slice is complete once the malformed JSON branch has direct test evidence and the evaluation project still passes.
