# ADR-006: AI-Assisted Security and Compliance Review

## Status

Accepted

## Context

The remediation plan initially assumed external security, compliance, and DBA support. The confirmed team is one developer plus AI, so those external functions are not available for v1 remediation.

The project still needs explicit security and compliance gates before release claims.

## Decision

Use AI-assisted security and compliance review as the v1 fallback, followed by maintainer manual validation and sign-off.

This fallback does not claim equivalence with a professional penetration test or independent compliance audit. It is a documented minimum gate for the current team model.

## Consequences

- The maintainer remains the final signer for security, compliance, migration, and release decisions.
- Attack-chain validation must be performed manually and recorded.
- Future production or customer-facing deployments should still consider independent review.

## Verification

- Security review records must include reviewed attack chains, results, and maintainer sign-off.
- Release notes must not imply external penetration testing unless it actually happened.
