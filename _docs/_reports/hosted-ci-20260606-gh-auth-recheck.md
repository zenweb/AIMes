# Hosted CI evidence

- GeneratedAt: 2026-06-06T13:52:16.1674118+08:00
- Status: MISSING_REMOTE_RUN
- RemoteName: origin
- CommitSha: 
- RunUrl: 
- RunId: 
- Evidence: 

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 1
fatal: remote error: Git:Project not found.
```

## gh run

```text
Exit code: 1
failed to determine base repo: none of the git remotes configured for this repository point to a known GitHub host. To tell gh about a new GitHub host, please use `gh auth login`
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, and job summary.
- Result: FAIL

## Violations

- RunUrl is required to close the hosted CI release gate.
- RunId is required to close the hosted CI release gate.
- Hosted CI job summary evidence is required to close the hosted CI release gate. Evidence cannot be a placeholder.
- gh run list must succeed in the authorized hosted CI evidence environment.

This report cannot close the hosted CI release gate.
