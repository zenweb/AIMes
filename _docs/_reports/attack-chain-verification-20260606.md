# Manual verification for Attack Chain A/B/C

- GeneratedAt: 2026-06-06T18:58:20.2496649+08:00
- Status: PENDING_MANUAL_VERIFICATION
- Verifier: 
- VerifiedAt: 
- Notes: 自动支持证据见 _docs/_reports/attack-chain-automated-evidence-20260606.md；人工 verifier、VerifiedAt 和 A/B/C evidence 仍待补。

## Attack Chain A

- Scenario: unauthorized or low-privilege access to authenticated APIs/admin/agent actions.
- Manual verification: PENDING
- Evidence: 

## Attack Chain B

- Scenario: credential, token, log, audit, frontend state, or export leakage.
- Manual verification: PENDING
- Evidence: 

## Attack Chain C

- Scenario: unsafe release configuration, weak CORS, missing dependencies, or vulnerable package promotion.
- Manual verification: PENDING
- Evidence: 

## Gate

- Manual verification is required before the human signer can close the security signoff release gate.
- Result: FAIL

## Violations

- Verifier is required for manual verification.
- VerifiedAt is required for manual verification.
- Attack Chain A manual verification is not PASS.
- Attack Chain B manual verification is not PASS.
- Attack Chain C manual verification is not PASS.
- Attack Chain A evidence is required. Evidence cannot be a placeholder.
- Attack Chain B evidence is required. Evidence cannot be a placeholder.
- Attack Chain C evidence is required. Evidence cannot be a placeholder.

This report cannot close the security signoff release gate.
