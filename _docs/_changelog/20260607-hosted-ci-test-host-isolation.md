# Hosted CI test host isolation

## Change

- Strengthened `TestWebApplicationFactory` and `PerformanceTestWebApplicationFactory` so integration test hosts replace any Redis-backed `IDistributedCache` with `DistributedMemoryCache` through `ConfigureTestServices`.
- Removed external dependency health checks (`postgresql`, `redis`, `rabbitmq`) from integration test host health registrations.

## Why

Hosted CI run `27086190738` failed because the test host still attempted to publish signing keys through Redis at `localhost:6379`, causing auth endpoints to return HTTP 500. `/health` also returned 503 because external ready checks leaked into anonymous endpoint authorization tests.

## Verification

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release --filter "FullyQualifiedName~AuthControllerTests|FullyQualifiedName~EndpointAuthorizationTests"`: passed, 10/10.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release`: passed, 175/175.
- `dotnet format src/backend/AIMes.slnx --verify-no-changes --no-restore`: passed.

