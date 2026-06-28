# BOM kitting OTD sync browser evidence

- GeneratedAt: 2026-06-15T10:35:00+08:00
- Scope: BOM kitting package publication when OTD evidence-chain local storage write fails in Chromium
- Result: PASS

## Scenario

Chromium injects `Storage.prototype.setItem` failure only for `aimes_otd_evidence_chain`, then publishes the BOM-A100 kitting package from the BOM page.

## Evidence

- The BOM kitting source changes to published state: `BOM 展开齐套包已进入库存与排产`.
- The primary audit and trace remain visible:
  - `AUD-BOM-KIT-BOM-A100-WO-RUSH-9001-20260522`
  - `TRACE-BOM-KIT-BOM-A100-WO-RUSH-9001`
- The publish action is locked through disabled button text: `BOM 齐套检查包已发布`.
- The alert fails loud with: `BOM 齐套检查包已发布，但 OTD 证据链同步失败`.
- The injected browser failure is visible: `chromium OTD evidence storage unavailable`.
- Primary package storage still contains `bom-kitting-package-bom-a100-wo-rush-9001`.
- OTD evidence-chain storage remains absent because the injected failure blocks `aimes_otd_evidence_chain`.

## Command

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 齐套检查包 OTD 证据链同步失败"
```

## Result

```text
Running 1 test using 1 worker
ok 1 [chromium] › tests\e2e\engineering-data.spec.ts:464:3 › Engineering data 工程数据约束 › BOM 齐套检查包 OTD 证据链同步失败后真实浏览器锁定发布动作 (1.0s)
1 passed (5.1s)
```

## Notes

- The run used the existing isolated e2e wrapper and did not rely on the failing Nuxt dev server path.
- This report does not change the release-gate gray observation status; gray observation remains deferred by owner, not strict PASS.
