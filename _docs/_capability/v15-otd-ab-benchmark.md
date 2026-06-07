# V1.5 Capability: OTD A/B Benchmark

## Scope

- Dataset: `DEMO-OTD-30-202605`.
- Seed: `20260523`.
- SQL seed: `db/seed-demo-otd-30-202605.sql`.
- Data dictionary: `_docs/_design/20260524-demo-otd-30-data-dictionary.md`.
- Real .NET runner: `src/tools/MES.Tools.AbBenchmark/` (no PowerShell hardcoded numbers).
- Driver script: `scripts/run-ab-comparison.ps1` (orchestrator only — calls dotnet test + console runner).
- Report outputs:
  - `src/frontend/public/reports/latest-ab-report.json`
  - `_docs/_reports/20260524-demo-otd-30-ab-report.md`

## Current Result (real .NET run, 2026-05-25)

```
Baseline (best of 4): WeightedComposite, OTD = 26.67%  (8/30 on time)
Agent:                Agent,             OTD = 30.00%  (9/30 on time)
Delta:                +3.33 pts (12.49% improvement)
95% CI for diff:      [-0.1946, 0.2612]
p-value:              0.7745
Significant @ 95%:    NO  (sample size 30 too small)
MonteCarlo mean:      +7.67 pts across 100 perturbations, 95% CI [6.92, 8.41]
```

**Honest framing**: the +3.33 pt single-run OTD improvement is real-engine measured (no PowerShell
hardcoded). But on a 30-order demo dataset the result does not clear the 95%
significance bar. The report explicitly labels `significantAt95: false`, per v3.0
roadmap rule: "if ΔOTD is not significant, mark it, do not brag."

## All baseline scenarios

| Scenario | OTD | On time | Delayed | Avg lateness h | Changeover min |
| --- | ---: | ---: | ---: | ---: | ---: |
| FCFS                 | 13.33% | 4 | 26 | 96.32 | 4020 |
| EDD                  | 6.67% |  2 | 28 | 89.50 | 3780 |
| LeastLoaded (EDD+LL) | 6.67% |  2 | 28 | 89.50 | 3780 |
| WeightedComposite    | 26.67% | 8 | 22 | 91.22 | 2040 |
| **Agent**            | **30.00%** | **9** | **21** | **59.76** | **2040** |

## Reproducibility

Two consecutive runs with the same seed preserve the single-run A/B result; `generatedAt`
and Monte Carlo summary fields refresh on each run.

## Verification

- `dotnet build src/tools/MES.Tools.AbBenchmark/MES.Tools.AbBenchmark.csproj`: passed (0 warning, 0 error).
- `dotnet test src\tests\MES.Tests.Unit --filter "FullyQualifiedName~RuleEngineBenchmarkTests"`: 7/7 passed.
- `powershell -ExecutionPolicy Bypass -NoProfile -File scripts\run-ab-comparison.ps1`: passed end-to-end.
- `dotnet build src/backend/AIMes.slnx`: passed (0 warning, 0 error, 8.49s).
- Frontend Dashboard and Report read `/reports/latest-ab-report.json` with demo fallback.

## Remaining work to make significance true

1. Wire Monte Carlo (already in `MonteCarloSimulator.cs`) into the runner so the
   effective sample size grows to ≥1000.
2. Or accept the demo dataset as illustrative only and shift sales narrative to
   "real significance comes from POC field data."

This is **not** in the current A-class scope; it is the next high-priority
follow-up to fully close the v3.0 quantification gate.
