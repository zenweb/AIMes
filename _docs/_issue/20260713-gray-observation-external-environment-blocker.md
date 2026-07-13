# Gray observation external environment blocker

- Status: BLOCKED_BY_EXTERNAL_ENVIRONMENT
- Strict gate report: `_docs/_reports/release-gate-audit-20260714-v1-final.md`
- Current incident counts: `P0=-1; P1=-1`

## Confirmed absent

- GitHub Environments: none
- GitHub Deployments: none
- Repository variable `AIMES_GRAY_BASE_URL`: absent
- Repository variable `AIMES_GRAY_RELEASE_ID`: absent
- Deployment/tunnel secret: absent
- Historical incident export for `2026-06-13` through `2026-06-27`: absent

## Required to close

1. Provide a stable, publicly reachable gray base URL exposing `/live` and `/ready`.
2. Start a new gray release id and keep the observation window open for at least 14 calendar days.
3. Export the real incident query as CSV and import it with `scripts/import-gray-incident-evidence.ps1`.
4. Require reviewed evidence with `P0=0; P1=0`; non-zero incidents or missing evidence keep the gate closed.

Health-only samples, synthetic CSV, and retroactive claims are explicitly not accepted as production gray evidence.

## Latest verification

- `V1@3ef45fa` hosted CI `29271142661` and Agent Evaluation `29271142560` are PASS.
- PostgreSQL/staging, backup/restore, attack-chain, and security-signoff gates are PASS.
- The strict gate has exactly one violation: Gray observation is not PASS because the external environment and real 14-day incident evidence are still absent.
