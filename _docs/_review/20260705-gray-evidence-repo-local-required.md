# Gray evidence repo-local required

## Summary

Hardened gray PASS evidence so a plain external string can no longer close the strict gray observation gate.

## Change

- `scripts/run-gray-observation.ps1` now rejects PASS evidence unless it includes a repo-local `_docs/` or `output/` reviewed monitoring or incident-review packet.
- `scripts/run-release-gate-audit.ps1` applies the same rule when validating a gray observation report.

## Validation

- Probe before the fix showed a plain external evidence string was accepted.
- The new rule requires repo-local evidence plus the existing reviewed packet and `IncidentQueryEvidence` content checks.

## Boundary

This still does not provide real production monitoring evidence. It prevents unverifiable external-only text from being used as strict release proof.
