# 2026-07-05 Offline Demo Leak Sweep Closure

## Decision

`PASS_WITH_FIELD_VERIFICATION_BOUNDARY`

The focused offline-demo backend leak sweep is closed for the three user-facing entries that were still being chased in this thread: purchase, barcode, and scanner.

## Closed Sweep Items

| Surface | Route | Guarded backend target | Review evidence | Remote commit | Hosted evidence |
| --- | --- | --- | --- | --- | --- |
| Purchase | `purchase?offlineDemo=1` | `/api/v1/purchase**` | `_docs/_review/20260705-purchase-offline-demo-leak-sweep.md` | `87ca7177275ca00cece9e87a559063d3df61c9c4` | CI `28720738060` success; Agent Evaluation `28720738050` success |
| Barcode | `barcode?offlineDemo=1` | `/api/v1/inventory**` | `_docs/_review/20260705-barcode-offline-demo-leak-sweep.md` | `fbcdba5895cfc54af4b912a7ab14bb88bdbdd148` | CI `28721098832` success; Agent Evaluation `28721098837` success |
| Scanner | `scanner?offlineDemo=1` | `/api/v1/scheduling/barcode-scan-evidence**` | `_docs/_review/20260705-scanner-offline-demo-leak-sweep.md` | `b65df540b251b51ad39d753a01de6f02fc6f94bc` | CI `28721410098` success; Agent Evaluation `28721410064` success |

## Current Head

- GitHub `zenweb/AIMes` branch `V1`: `b65df540b251b51ad39d753a01de6f02fc6f94bc`.

## Verification Commands

```text
npm run test:e2e -- --grep "离线演示采购入口不会触达采购后端接口"
Result: 1 passed

npm run test:e2e -- --grep "离线演示条码入口不会触达库存后端接口"
Result: 1 passed

npm run test:e2e -- --grep "离线演示扫码入口不会触达扫码证据后端接口"
Result: 1 passed
```

## Boundary

This closure does not claim strict final v1.0.0 release completion.

The requested `DeviceDataIocTask` and `usemark=9` field checks remain outside the active AIMes runtime. The current fail-loud evidence is already sealed in:

- `_docs/_reports/20260705-device-data-field-verification-boundary.md`
- `_docs/_issue/20260705-device-data-field-verification-environment-mismatch.md`
- `_docs/_changelog/20260705-device-data-field-verification-boundary.md`

Strict field closure still requires the correct device-data runtime, repository, service, or log bundle that actually contains `DeviceDataIocTask`, `ShouldQuarantine`, `SubmitLockHandle`, and the queue surface where `usemark=9` is written.
