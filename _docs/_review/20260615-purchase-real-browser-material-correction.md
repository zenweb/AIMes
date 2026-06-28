# 2026-06-15 Review: purchase real browser material correction

## Result
- Pass. Two real Chromium E2E slices prove the procurement recovery UI flows are executable in a production Nuxt build.

## Evidence
- Supplier SLA selection:
  - Purchase selects `华东快供二厂`.
  - Scheduling shows `MAT-B02 供应商绩效与 SLA 选优`.
  - Report shows `TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA`.
  - Audit replay shows the supplier network evidence.
- Material anomaly correction:
  - Anomaly dispatch confirms material routing.
  - Inventory records batch isolation.
  - Purchase locks supplier correction.
  - Scheduling, report, and audit replay show the procurement correction chain with `TRACE-ANOMALY-DISPATCH-MATERIAL-BATCH-20260521`.

## Residual Risk
- This is local Playwright evidence, not Docker/PostgreSQL staging evidence.
- Docker API was unavailable from this shell session, so container-based host `5002` smoke remains a separate follow-up.
