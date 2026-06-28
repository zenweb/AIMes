# Next Actions: Test Project API Reference Skip Frontend Copy

## Immediate
- Continue using bounded filtered backend tests unless a full-suite run has an explicit timeout and stop condition.
- Treat the previous full integration timeout as incomplete evidence, not as a product failure.

## Follow-up Candidates
- Add a dedicated script for the Employee -> Production -> Scheduling evidence-chain tests with `dotnet build-server shutdown` and bounded filters.
- Revisit the full integration suite runtime separately after the current backend evidence chain is stable.
- If full-suite runs are required, use explicit logging and a longer timeout so failures can be attributed to test failures rather than build side effects.

