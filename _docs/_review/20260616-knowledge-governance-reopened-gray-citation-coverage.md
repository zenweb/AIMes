# 2026-06-16 Knowledge Governance Reopened Gray Citation Coverage Review

## Decision

Accepted as a boutique hardening slice for an existing governance-critical path.

## Scope

- Test-only change in `src/frontend/tests/unit/knowledge-governance-panel.test.ts`.
- No production behavior changed.
- The new tests document existing behavior that was not directly protected by the previous suite.

## Evidence

- Targeted unit suite increased from `5` to `9` tests.
- `KnowledgeGovernancePanel.vue` line coverage reached `100%`.
- Full frontend coverage passed with `111 files / 1050 tests`.

## Risks

- Single-file coverage command still exits `1` due to project-wide imported-file thresholds, even though the component target is green and improved. Use the component table and full coverage command as the authoritative evidence.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
- Worktree remains broadly dirty; future work must avoid reverting unrelated changes.

## Next Routing

Do not continue residual `KnowledgeGovernancePanel.vue` line chasing. Pick the next existing user-critical path by coverage leverage and business value.
