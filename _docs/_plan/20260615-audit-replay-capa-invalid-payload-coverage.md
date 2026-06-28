# 2026-06-15 audit replay CAPA invalid payload coverage plan

## Success Criteria

- Use the current coverage summary to select the next component.
- Prefer phase-one auditability behavior over cosmetic rendering.
- Add a test that encodes the fail-loud audit invariant.
- Verify with targeted and full frontend unit coverage.

## Execution

1. Sort current component coverage after the Skill Matrix slice.
2. Select `AuditDecisionReplayPanel.vue`.
3. Read the component and existing audit replay tests.
4. Add incomplete CAPA replay payload coverage.
5. Run focused and full coverage verification.

## Stop Condition

Stop after one audit-relevant slice and documented verification. Do not treat this as release gate closure while PostgreSQL/staging remains FAIL.
