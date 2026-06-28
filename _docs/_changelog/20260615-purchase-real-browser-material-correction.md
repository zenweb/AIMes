# 2026-06-15 Changelog: purchase real browser material correction

## Changed
- Added real Chrome evidence for the procurement recovery paths without changing production code.
- Verified the existing browser flow for material anomaly dispatch through inventory isolation, purchase supplier correction, scheduling review, report OTD evidence, and audit replay.
- Verified the existing browser flow for supplier SLA selection through scheduling, report evidence, and audit replay.

## Verification
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "供应商绩效 SLA 选优进入排产复核和 OTD 审计"` passed: 1/1 on Chromium.
- `npm run test:e2e -- tests/e2e/anomaly.spec.ts -g "物料异常确认分流后进入库存隔离、采购整改、排产复核和 OTD 审计"` passed: 1/1 on Chromium.

## Notes
- Docker was not used for this evidence because the current PowerShell session could not connect to `dockerDesktopLinuxEngine`.
- The Playwright config started the Nuxt preview web server on its managed local E2E port and ran Chrome against the production build.
