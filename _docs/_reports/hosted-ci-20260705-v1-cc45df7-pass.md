# Hosted CI evidence

- GeneratedAt: 2026-07-05T05:06:59.2964539+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: cc45df7cfa3f343ceb2036722215aa04f83b40aa
- HeadSha: cc45df7cfa3f343ceb2036722215aa04f83b40aa
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28719432617
- RunId: 28719432617
- Evidence: GitHub Actions CI run 28719432617 completed success on V1 head cc45df7cfa3f343ceb2036722215aa04f83b40aa; backend, frontend, security, and container jobs completed success. Agent Evaluation run 28719432629 also completed success on the same branch and head after Microsoft.OpenApi was pinned to 2.7.5.

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
completed	success	fix: pin Microsoft.OpenApi patched version	Agent Evaluation	V1	push	28719432629	2m12s	2026-07-04T20:57:21Z
completed	success	fix: pin Microsoft.OpenApi patched version	CI	V1	push	28719432617	8m3s	2026-07-04T20:57:21Z
completed	failure	docs: seal release evidence audit followups	CI	V1	push	28719077097	5m18s	2026-07-04T20:42:58Z
completed	failure	docs: seal release evidence audit followups	Agent Evaluation	V1	push	28719077092	50s	2026-07-04T20:42:58Z
completed	success	chore: record hosted ci evidence and clean tmp gitlinks	Agent Evaluation	V1	push	28449632371	2m5s	2026-06-30T13:53:24Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"cc45df7cfa3f343ceb2036722215aa04f83b40aa","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28719432617","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
