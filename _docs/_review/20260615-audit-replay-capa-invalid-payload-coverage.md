# 2026-06-15 audit replay CAPA invalid payload coverage review

## Findings

- No blocker found in the added test slice.
- The change is test-only and exercises existing fail-loud behavior.
- The covered invariant is release-relevant: incomplete CAPA replay evidence must be visible as an alert while preserving the operator's base replay context.

## Evidence

- Targeted audit replay unit file passes with 29 tests.
- Full frontend unit coverage passes with 959 tests.
- The release gate is not affected: PostgreSQL/staging remains the separate hard red gate until fresh staging evidence is PASS.

## Residual Risk

- This is unit-level evidence. Real browser audit replay evidence should still be collected after the runtime/staging path is available.
