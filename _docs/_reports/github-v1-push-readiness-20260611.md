# GitHub V1 push readiness

- GeneratedAt: 2026-06-11T09:49:35.9457382+08:00
- Repository: zenweb/AIMes
- Branch: V1
- LocalHead: d8bb6e484f86a6fbd6673317385caf34ba774ee2
- GitHubBranchHead: 50c49cd4250570f1ca5903eef22b29014dd836b4
- SshKeyPath: C:\Users\陈奕铭\.ssh\aa
- SshKeyExists: True
- SshKeyFingerprint: 3072 SHA256:ig8/HELl51W0VVjhPqHmHWIiHtzlQBOk555r8N6wwbc 陈奕铭@YiMing (RSA)

## Summary

| Check | Status |
| --- | --- |
| GitHub branch matches local HEAD | FAIL |
| GitHub CI run exists on branch | FAIL |
| GitHub Agent Evaluation run exists on branch | FAIL |
| HTTPS transport reachable | PASS |
| SSH key accepted | FAIL |

## Command Evidence

### gh auth status

- ExitCode: 0

```text
github.com
  ✓ Logged in to github.com account zenweb (keyring)
  - Active account: true
  - Git operations protocol: https
  - Token: gho_************************************
  - Token scopes: 'gist', 'read:org', 'repo', 'workflow'
```

### GitHub repository view

- ExitCode: 0

```text
{"defaultBranchRef":{"name":"V1"},"nameWithOwner":"zenweb/AIMes"}
```

### GitHub branch ref via API

- ExitCode: 0

```text
50c49cd4250570f1ca5903eef22b29014dd836b4
```

### GitHub CI runs on branch

- ExitCode: 0

```text
[]
```

### GitHub Agent Evaluation runs on branch

- ExitCode: 0

```text
[]
```

### git HTTPS ls-remote

- ExitCode: 0

```text
50c49cd4250570f1ca5903eef22b29014dd836b4	refs/heads/V1
```

### SSH auth with configured key

- ExitCode: 1

```text
git@github.com: Permission denied (publickey).
```

## Gate

- Result: FAIL

## Violations

- GitHub V1 does not match local HEAD.
- GitHub V1 has no CI run.
- GitHub V1 has no Agent Evaluation run.

This check cannot trigger or close hosted CI. Fix the violations, then push V1 and wait for hosted workflows.
