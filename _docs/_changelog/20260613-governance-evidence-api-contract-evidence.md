# 2026-06-13 Changelog: Governance evidence API contract evidence

## Changed

- Added direct unit contract evidence for `src/api/governanceEvidence.ts`.
- Covered agent config approval query/upsert endpoints.
- Covered default fallback and `failLoud` behavior.

## Verification

- `npm run test:unit -- tests/unit/governance-evidence-api.test.ts` => 2 passed.
- `npm run test:unit -- tests/unit/governance-evidence-api.test.ts tests/unit/agent-config-approval-sync.test.ts` => 8 passed.
- `npm run test:unit:coverage -- tests/unit/governance-evidence-api.test.ts` => focused summary 100% statements and 100% lines.

