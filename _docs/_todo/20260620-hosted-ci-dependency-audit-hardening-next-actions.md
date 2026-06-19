# Todo: Hosted CI Dependency Audit Hardening Next Actions

- Push the dependency-audit hardening changes to `V1`.
- Observe the next GitHub Actions CI and Agent Evaluation runs.
- Generate a hosted CI evidence report only after the hosted run is green.
- Re-run the release gate audit after hosted CI evidence is refreshed.
- Keep the gray observation gate explicit as deferred by owner, not silently completed.
