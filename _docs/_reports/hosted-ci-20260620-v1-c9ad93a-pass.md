# Hosted CI evidence

- GeneratedAt: 2026-06-20T04:33:32.2193117+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: c9ad93a5708c501724462f8fef65df686d10f422
- HeadSha: c9ad93a5708c501724462f8fef65df686d10f422
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27846825016
- RunId: 27846825016
- Evidence: GitHub Actions CI run 27846825016 completed success on latest V1 head c9ad93a5708c501724462f8fef65df686d10f422; jobs security, frontend, backend, and container all concluded success. Agent Evaluation run 27846825028 also completed success on the same branch and head.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 1
fatal: unable to access 'https://github.com/zenweb/AIMes.git/': Recv failure: Connection was reset
```

## gh run

```text
Exit code: 0
completed	success	Record latest V1 hosted CI pass evidence	Agent Evaluation	V1	push	27846825028	2m0s	2026-06-19T20:23:45Z
completed	success	Record latest V1 hosted CI pass evidence	CI	V1	push	27846825016	7m29s	2026-06-19T20:23:45Z
completed	success	Refresh hosted CI evidence for current V1 head	Agent Evaluation	V1	push	27846456486	2m10s	2026-06-19T20:14:18Z
completed	success	Refresh hosted CI evidence for current V1 head	CI	V1	push	27846456482	7m10s	2026-06-19T20:14:18Z
completed	success	Repair schedule repository CI build	CI	V1	push	27846043068	7m43s	2026-06-19T20:03:36Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"c9ad93a5708c501724462f8fef65df686d10f422","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846825016","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
