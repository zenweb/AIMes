# Changelog - Index Agent E2E Plus Formal Docs Archive

## Changed

- Exported the current staged package to `tmp/index-agent-e2e-plus-formal-docs-20260622.patch`.
- Recorded patch size and SHA256.
- Documented the package boundary and restore check.
- Recorded that the archive patch remains untracked because staging it causes `git diff --cached --check` whitespace failures inside the patch payload.

## Validation

- `git diff --cached --check`: PASS
- `Get-FileHash` recorded SHA256.
