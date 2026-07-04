# 2026-07-05 Fable 5 Release Evidence Seal Changelog

## Changed

- Committed the previously staged hosted CI and deferred-gray release gate evidence packets in commit `74719395ca09d790f185ae47a63c6f67632642ba`.
- Added `_docs/_review/20260705-fable5-release-evidence-seal.md` to record the remediation and remaining evidence boundary.

## Verified

- `git status --short -- <four sealed evidence files>` returns no output.
- `git show --stat --oneline HEAD` shows only the four hosted-CI/release-gate evidence files in commit `7471939`.
- `git cat-file -t ca7e4b7001eb9861e905ac958ebcd32fd19dede9` returns `commit`.

## Remaining

- Hosted CI evidence remains tied to the historical GitHub `V1` head `ca7e4b7`, not the current local dirty worktree.
- Strict gray observation PASS still requires real monitoring or signed incident-review evidence proving `P0=0` and `P1=0` for the elapsed window.
