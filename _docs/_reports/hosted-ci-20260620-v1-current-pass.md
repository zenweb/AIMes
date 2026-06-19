# Hosted CI evidence

- GeneratedAt: 2026-06-20T04:12:47.4015089+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: 374d5b6c12814416282962919922524c9ab9c31a
- HeadSha: 374d5b6c12814416282962919922524c9ab9c31a
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27846043068
- RunId: 27846043068
- Evidence: GitHub Actions CI run 27846043068 completed success on V1 head 374d5b6c12814416282962919922524c9ab9c31a; jobs security, frontend, backend, and container all concluded success. Agent Evaluation run 27846043049 also completed success on the same branch and head.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 0
374d5b6c12814416282962919922524c9ab9c31a	refs/heads/V1
cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74	refs/heads/main
```

## gh run

```text
Exit code: 0
completed	success	Repair schedule repository CI build	CI	V1	push	27846043068	7m43s	2026-06-19T20:03:36Z
completed	success	Repair schedule repository CI build	Agent Evaluation	V1	push	27846043049	2m1s	2026-06-19T20:03:36Z
completed	failure	Repair hosted CI current head	CI	V1	push	27845824684	3m59s	2026-06-19T19:58:08Z
completed	failure	Repair hosted CI current head	Agent Evaluation	V1	push	27845824668	1m38s	2026-06-19T19:58:08Z
completed	failure	Harden hosted CI dependency audit	CI	V1	push	27845060646	1m41s	2026-06-19T19:38:01Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"374d5b6c12814416282962919922524c9ab9c31a","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27846043068","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
