# Hosted CI evidence

- GeneratedAt: 2026-07-05T06:40:00+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: 36ff3388197fb6540221c5cb79373882f26863d1
- HeadSha: 36ff3388197fb6540221c5cb79373882f26863d1
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28721692957
- RunId: 28721692957
- Evidence: GitHub Actions CI run 28721692957 completed success on V1 head 36ff3388197fb6540221c5cb79373882f26863d1. Agent Evaluation run 28721692960 also completed success on the same branch and head after the offline-demo leak sweep closure evidence was sealed.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## gh run

```text
completed	success	docs: close offline demo leak sweep evidence	Agent Evaluation	V1	push	28721692960	2m1s	2026-07-04T22:29:29Z
completed	success	docs: close offline demo leak sweep evidence	CI	V1	push	28721692957	7m39s	2026-07-04T22:29:29Z
```

## gh run view

```text
{"conclusion":"success","headBranch":"V1","headSha":"36ff3388197fb6540221c5cb79373882f26863d1","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28721692957","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
