# Review: Hosted CI test host isolation

## Scope

- Files reviewed: `src/tests/MES.Tests.Integration/TestWebApplicationFactory.cs`, `src/tests/MES.Tests.Integration/PerformanceTestWebApplicationFactory.cs`.
- Change type: test infrastructure hardening for hosted CI parity.

## Findings

- No production service registration was weakened. `Program.cs` still constructs `SigningKeyStore` with `IDistributedCache`, preserving cross-replica Redis behavior for configured deployments.
- The fix uses `ConfigureTestServices`, which is the correct late override point for `WebApplicationFactory` test hosts.
- Health check removal is scoped to external dependency checks only; `self`, `startup`, and Qdrant disabled-by-provider behavior remain available for test requests.

## Residual risk

Hosted CI must still be re-run before closing the hosted CI gate. Local PASS is not release evidence.

