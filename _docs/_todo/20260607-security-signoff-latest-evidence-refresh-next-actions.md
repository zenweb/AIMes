# 2026-06-07 Security Signoff Latest Evidence Refresh Next Actions

## Next

- Human verifier reviews `_docs/_reports/attack-chain-manual-verification-packet-20260607.md`.
- After A/B/C manual verification PASS, run `scripts/run-attack-chain-verification.ps1` with real evidence.
- Only after that, fill signer, signed timestamp, decision, and evidence in `_docs/_review/20260607-security-signoff.md`.

## Do Not Do

- Do not sign while Attack Chain manual report remains pending.
- Do not use hosted CI success as a substitute for security signoff.
