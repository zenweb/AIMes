# GitHub V1 push readiness

- GeneratedAt: 2026-06-20T02:11:50.6574600+08:00
- Repository: zenweb/AIMes
- Branch: V1
- LocalHead: d8bb6e484f86a6fbd6673317385caf34ba774ee2
- GitHubBranchHead: d8bb6e484f86a6fbd6673317385caf34ba774ee2
- SshKeyPath: C:\Users\陈奕铭\.ssh\aa
- SshKeyExists: True
- SshKeyFingerprint: 3072 SHA256:ig8/HELl51W0VVjhPqHmHWIiHtzlQBOk555r8N6wwbc 陈奕铭@YiMing (RSA)

## Summary

| Check | Status |
| --- | --- |
| GitHub branch matches local HEAD | PASS |
| GitHub CI run succeeded for local HEAD | PASS |
| GitHub Agent Evaluation run succeeded for local HEAD | PASS |
| HTTPS transport reachable | FAIL |
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
d8bb6e484f86a6fbd6673317385caf34ba774ee2
```

### GitHub CI runs on branch

- ExitCode: 0

```text
[{"conclusion":"success","createdAt":"2026-06-11T01:51:20Z","databaseId":27318467207,"headBranch":"V1","headSha":"d8bb6e484f86a6fbd6673317385caf34ba774ee2","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27318467207","workflowName":"CI"}]
```

### GitHub Agent Evaluation runs on branch

- ExitCode: 0

```text
[{"conclusion":"success","createdAt":"2026-06-11T01:51:20Z","databaseId":27318467206,"headBranch":"V1","headSha":"d8bb6e484f86a6fbd6673317385caf34ba774ee2","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27318467206","workflowName":"Agent Evaluation"}]
```

### git HTTPS ls-remote

- ExitCode: 1

```text
fatal: unable to access 'https://github.com/zenweb/AIMes.git/': Recv failure: Connection was reset
```

### SSH auth with configured key

- ExitCode: 1

```text
git@github.com: Permission denied (publickey).
```

## Gate

- Result: PASS

## Transport Note

- Hosted CI evidence is complete for the current branch/head.
- Current Git transport check did not prove a reusable push channel. Future pushes may still require HTTPS connectivity or an accepted SSH key.
