# Hosted CI evidence

- GeneratedAt: 2026-07-05T18:45:47.6566466+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: 56b98dbddba9ccb316e55966b2df444fa6d31a2b
- HeadSha: 56b98dbddba9ccb316e55966b2df444fa6d31a2b
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28737885689
- RunId: 28737885689
- Evidence: GitHub Actions CI run 28737885689 completed success on V1 head 56b98dbddba9ccb316e55966b2df444fa6d31a2b; Agent Evaluation run 28737885706 also completed success on the same branch and head. This head seals repo-local gray evidence packet hardening.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 0
56b98dbddba9ccb316e55966b2df444fa6d31a2b	refs/heads/V1
cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74	refs/heads/main
```

## gh run

```text
Exit code: 0
completed	success	fix: require repo-local gray evidence packet	Agent Evaluation	V1	push	28737885706	2m5s	2026-07-05T10:34:39Z
completed	success	fix: require repo-local gray evidence packet	CI	V1	push	28737885689	7m21s	2026-07-05T10:34:39Z
completed	success	fix: validate gray aggregate incident evidence content	Agent Evaluation	V1	push	28737561356	2m10s	2026-07-05T10:21:41Z
completed	success	fix: validate gray aggregate incident evidence content	CI	V1	push	28737561355	7m36s	2026-07-05T10:21:41Z
completed	success	fix: require gray incident evidence content	Agent Evaluation	V1	push	28737161975	2m6s	2026-07-05T10:05:50Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"56b98dbddba9ccb316e55966b2df444fa6d31a2b","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28737885689","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
