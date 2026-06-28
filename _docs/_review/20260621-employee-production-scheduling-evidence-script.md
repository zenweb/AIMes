# Review: Employee Production Scheduling Evidence Script

## Scope
- Added a bounded backend evidence-chain script for Employee -> Production -> Scheduling.
- The script does not replace the full integration suite; it makes the current boutique hardening path repeatable without unbounded test runs.

## Findings
- Repeated ad hoc `dotnet test` commands were slow and prone to build-server/file-lock noise.
- The new script runs the exact focused checks currently proving operation-code ordering, production scan handoff, repository ordering, and scheduling context readback.
- The script explicitly runs `dotnet build-server shutdown` and uses `/p:SkipFrontendBuildCopy=true`.

## Residual Risk
- Full integration-suite baseline is still unproven in this turn.
- Future slices should add their focused tests to this script only if they belong to the same Employee -> Production -> Scheduling evidence chain.

