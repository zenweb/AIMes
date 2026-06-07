# 2026-06-07 Attack Chain Manual Verification Packet Next Actions

## Human Action Required

- Review `_docs/_reports/attack-chain-manual-verification-packet-20260607.md`.
- Perform manual checks for Attack Chain A, B, and C.
- Run `scripts/run-attack-chain-verification.ps1` with real verifier, timestamp, and concrete evidence.
- Update security signoff only after Attack Chain manual verification is `PASS`.

## Do Not Do

- Do not use automated support evidence alone as manual PASS.
- Do not use placeholder evidence such as `TBD`, `TODO`, `PENDING`, `待补`, or `待定`.
- Do not sign security until A/B/C each has its own concrete evidence line.
