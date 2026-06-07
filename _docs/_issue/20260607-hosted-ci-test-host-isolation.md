# Issue: Hosted CI integration tests used external Redis

## Symptom

GitHub Actions CI run `27086190738` failed in backend integration tests:

- `AuthControllerTests` auth requests returned HTTP 500.
- `EndpointAuthorizationTests.Health_ShouldRemainAnonymous` returned HTTP 503.

## Root cause

The test host still retained Redis-backed `IDistributedCache` from default configuration, so `SigningKeyStore` attempted to write signing keys to `localhost:6379` during auth requests. External health checks also remained registered for `/health`.

## Resolution

Integration test host setup now performs a late `ConfigureTestServices` override to force `DistributedMemoryCache` and remove external dependency health checks.

## Status

Local verification passed. Hosted CI evidence is still pending.

