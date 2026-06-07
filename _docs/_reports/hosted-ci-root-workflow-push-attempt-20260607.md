# Hosted CI root workflow push attempt

- GeneratedAt: 2026-06-07T14:50:00+08:00
- Status: PUSH_BLOCKED
- CommitSha: 53393d2
- CommitSubject: Fix hosted CI root workflow
- RemoteName: github
- TargetBranch: main

## Root cause addressed locally

- Previous hosted CI run `27084449100` failed because workflow steps referenced old `v1/` working directories.
- Local workflow now runs from repository root.
- Local validation passed for backend, frontend, coverage threshold, and official npm audit.

## Push attempt

```text
Command: git push github HEAD:refs/heads/main
Exit code: 1
fatal: unable to access 'https://github.com/zenweb/AIMes.git/': Failed to connect to github.com port 443 after 21133 ms: Could not connect to server
```

## GitHub API recheck

```text
gh repo view zenweb/AIMes --json nameWithOwner,url,pushedAt,defaultBranchRef
defaultBranchRef: V1
pushedAt: 2026-06-07T06:02:50Z

gh run list --repo zenweb/AIMes --limit 5
completed failure CI main push 27084449100
completed failure Agent Evaluation main push 27084449085
```

## Gate

- Result: FAIL

## Violations

- New hosted runner run was not triggered because `git push` failed.
- Hosted CI release gate still depends on a new GitHub Actions run with `conclusion=success`.
