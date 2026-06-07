# Security evidence refresh

## Change

- Updated `run-attack-chain-automated-evidence.ps1` to run its evidence tests with `--configuration Release`, avoiding stale Debug `obj` file locks while preserving the same test filters.
- Regenerated `_docs/_reports/attack-chain-automated-evidence-20260607-current.md` with `Result: PASS`.
- Regenerated `_docs/_reports/security-self-assessment-20260607-current.md` with `Result: PASS`.
- Refreshed the repo-local CC plan bridge and security signoff packet so Hosted CI no longer appears as a stale failure.

## Verification

- `run-attack-chain-automated-evidence.ps1`: PASS.
- `run-security-self-assessment.ps1`: PASS.
- `dotnet format src/backend/AIMes.slnx --verify-no-changes --no-restore`: PASS.
- PowerShell parser for `run-attack-chain-automated-evidence.ps1`: PASS.

## Remaining blockers

PostgreSQL/staging, manual Attack Chain A/B/C verification, human security signoff, and gray observation remain open.

