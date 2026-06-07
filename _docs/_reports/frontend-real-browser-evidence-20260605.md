# 2026-06-05 Frontend Real Browser Evidence

## Result

- Result: PASS
- Scope: Nuxt production build + Playwright Chromium project using Google Chrome channel.
- Command: `npm run test:e2e -- modules.spec.ts demo-asset-capture.spec.ts`
- Working directory: `src/frontend`
- Outcome: `17 passed`

## Covered Paths

- Demo asset capture:
  - Dashboard hero with V1.5 OTD numbers.
  - Risk action queue.
  - Scheduling Agent multi-scenario decision.
  - Production execution writeback.
  - Report center A/B real numbers.
- User-critical module rendering:
  - Scheduling.
  - Quality.
  - Risk.
  - Employee.
  - Equipment.
  - Inventory.
  - Report.
  - Barcode print.
  - Scanner.
  - Knowledge document upload.
  - Audit logs.
  - Monitoring.

## Screenshot Evidence

- `_docs/_marketing/demo-screenshots/01-dashboard-hero.png`
- `_docs/_marketing/demo-screenshots/02-risk-queue.png`
- `_docs/_marketing/demo-screenshots/03-scheduling-agent.png`
- `_docs/_marketing/demo-screenshots/04-production-execution.png`
- `_docs/_marketing/demo-screenshots/05-report-center.png`

## Notes

- This evidence is a frontend browser-quality signal only.
- It does not close hosted CI, PostgreSQL/staging rehearsal, human attack-chain verification, security signoff, or the two-week gray observation gate.
- Nuxt build still emits the known large chunk warning for chunks over `900 kB`; treat that as a separate performance follow-up.
