# 2026-06-18 Eval Malformed Golden Fail Closed

- Added a regression test to `src/tests/MES.Tests.Evaluation/EvalScriptTests.cs` that proves `eval.ps1` fails closed when a golden dataset contains malformed JSON.
- Kept the implementation scope narrow: no production code changed, only the evaluation test harness gained direct evidence for the parse-error branch.

## Verification

- `dotnet test src/tests/MES.Tests.Evaluation/MES.Tests.Evaluation.csproj -c Release --filter "EvalScript_WhenGoldenDatasetIsMalformed_ShouldFailClosed"`
  - `1 passed`
- `dotnet test src/tests/MES.Tests.Evaluation/MES.Tests.Evaluation.csproj -c Release`
  - `3 passed`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj -c Release`
  - `444 passed`
