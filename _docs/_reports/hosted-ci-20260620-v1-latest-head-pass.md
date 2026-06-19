# Hosted CI evidence

- GeneratedAt: 2026-06-20T04:23:29.5982982+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: 803765e485dfa1463cdd463f6274cdf570dbb460
- HeadSha: 803765e485dfa1463cdd463f6274cdf570dbb460
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27846456482
- RunId: 27846456482
- Evidence: GitHub Actions CI run 27846456482 completed success on latest V1 head 803765e485dfa1463cdd463f6274cdf570dbb460; jobs security, frontend, backend, and container all concluded success. Agent Evaluation run 27846456486 also completed success on the same branch and head.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 0
803765e485dfa1463cdd463f6274cdf570dbb460	refs/heads/V1
cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74	refs/heads/main
```

## gh run

```text
Exit code: 0
completed	success	Refresh hosted CI evidence for current V1 head	Agent Evaluation	V1	push	27846456486	2m10s	2026-06-19T20:14:18Z
completed	success	Refresh hosted CI evidence for current V1 head	CI	V1	push	27846456482	7m10s	2026-06-19T20:14:18Z
completed	success	Repair schedule repository CI build	CI	V1	push	27846043068	7m43s	2026-06-19T20:03:36Z
completed	success	Repair schedule repository CI build	Agent Evaluation	V1	push	27846043049	2m1s	2026-06-19T20:03:36Z
completed	failure	Repair hosted CI current head	CI	V1	push	27845824684	3m59s	2026-06-19T19:58:08Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"803765e485dfa1463cdd463f6274cdf570dbb460","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846456482","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
