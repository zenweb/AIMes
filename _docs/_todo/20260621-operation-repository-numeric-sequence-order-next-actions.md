# Next Actions: Operation Repository Numeric Sequence Order

## Immediate
- Continue CC remediation with evidence-first slices on the Employee -> Production -> Scheduling path.
- Avoid further polishing already-covered UI details until backend-backed read/write evidence is stable.

## Follow-up Candidates
- Sweep for other user-critical read models that still depend on lexical identifiers where numeric sequence semantics are expected.
- Consider a shared `OperationCode` sequence helper if another production caller needs the same parsing rule.
- Investigate the `MES.Api.csproj` frontend copy/cleanup race separately if parallel backend test runs keep colliding on `wwwroot/scheduling`.

