# 2026-06-20 GitHub V1 Push Readiness Current HEAD

## Change

- Added `.gitignore` entries for local Nuxt probe/build directories and root local output folders to keep generated artifacts out of hosted CI pushes.
- Ran GitHub V1 push readiness for the current committed HEAD.

## Evidence

- Command: `scripts/test-github-v1-push-readiness.ps1`
- Report: `_docs/_reports/github-v1-push-readiness-20260620-current-head.md`
- Result: `PASS`
- LocalHead: `d8bb6e484f86a6fbd6673317385caf34ba774ee2`
- GitHubBranchHead: `d8bb6e484f86a6fbd6673317385caf34ba774ee2`
- GitHub CI run for LocalHead: PASS
- GitHub Agent Evaluation run for LocalHead: PASS

## Boundary

- This proves the committed `V1` HEAD and hosted CI are aligned.
- It does not prove the current dirty working tree, which still contains many uncommitted source and documentation changes.
- Transport checks in the readiness report did not prove HTTPS or SSH push availability, even though `gh auth status` was previously valid.
