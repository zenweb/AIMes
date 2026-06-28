# GitHub V1 push readiness

- GeneratedAt: 2026-06-21T14:11:57.9701778+08:00
- Repository: zenweb/AIMes
- Branch: V1
- LocalHead: 47d65547557a8a6cf035327ae94455a1a1285daf
- GitHubBranchHead: 47d65547557a8a6cf035327ae94455a1a1285daf
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
47d65547557a8a6cf035327ae94455a1a1285daf
```

### GitHub CI runs on branch

- ExitCode: 0

```text
[{"conclusion":"success","createdAt":"2026-06-19T21:14:39Z","databaseId":27848757617,"headBranch":"V1","headSha":"47d65547557a8a6cf035327ae94455a1a1285daf","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27848757617","workflowName":"CI"},{"conclusion":"success","createdAt":"2026-06-19T20:59:42Z","databaseId":27848203224,"headBranch":"V1","headSha":"007f7458b96c391bb2e0227f3e9753e0901fd3b2","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27848203224","workflowName":"CI"},{"conclusion":"success","createdAt":"2026-06-19T20:23:45Z","databaseId":27846825016,"headBranch":"V1","headSha":"c9ad93a5708c501724462f8fef65df686d10f422","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846825016","workflowName":"CI"},{"conclusion":"success","createdAt":"2026-06-19T20:14:18Z","databaseId":27846456482,"headBranch":"V1","headSha":"803765e485dfa1463cdd463f6274cdf570dbb460","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846456482","workflowName":"CI"},{"conclusion":"success","createdAt":"2026-06-19T20:03:36Z","databaseId":27846043068,"headBranch":"V1","headSha":"374d5b6c12814416282962919922524c9ab9c31a","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846043068","workflowName":"CI"}]
```

### GitHub Agent Evaluation runs on branch

- ExitCode: 0

```text
[{"conclusion":"success","createdAt":"2026-06-19T21:14:39Z","databaseId":27848757651,"headBranch":"V1","headSha":"47d65547557a8a6cf035327ae94455a1a1285daf","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27848757651","workflowName":"Agent Evaluation"},{"conclusion":"success","createdAt":"2026-06-19T20:59:42Z","databaseId":27848203222,"headBranch":"V1","headSha":"007f7458b96c391bb2e0227f3e9753e0901fd3b2","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27848203222","workflowName":"Agent Evaluation"},{"conclusion":"success","createdAt":"2026-06-19T20:23:45Z","databaseId":27846825028,"headBranch":"V1","headSha":"c9ad93a5708c501724462f8fef65df686d10f422","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846825028","workflowName":"Agent Evaluation"},{"conclusion":"success","createdAt":"2026-06-19T20:14:18Z","databaseId":27846456486,"headBranch":"V1","headSha":"803765e485dfa1463cdd463f6274cdf570dbb460","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846456486","workflowName":"Agent Evaluation"},{"conclusion":"success","createdAt":"2026-06-19T20:03:36Z","databaseId":27846043049,"headBranch":"V1","headSha":"374d5b6c12814416282962919922524c9ab9c31a","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846043049","workflowName":"Agent Evaluation"}]
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
