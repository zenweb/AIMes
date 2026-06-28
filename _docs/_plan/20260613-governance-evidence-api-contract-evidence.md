# 2026-06-13 Plan: Governance evidence API contract evidence

## Success criteria

- Select an audit-critical helper with fail-loud semantics.
- Verify endpoint paths, write payloads, fallback behavior, and fail-loud behavior.
- Run related approval sync regression.

## Result

- Selected `src/api/governanceEvidence.ts` because approval replay must fail loudly when requested.
- Added focused API contract tests.
- Verified agent config approval sync regression.

