# Hosted CI evidence

- GeneratedAt: 2026-07-05T15:25:51.4969952+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: e7eff755bff4b465b4e659b569bfe00cdd32f26c
- HeadSha: e7eff755bff4b465b4e659b569bfe00cdd32f26c
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28733003837
- RunId: 28733003837
- Evidence: GitHub Actions CI run 28733003837 completed success on V1 head e7eff755bff4b465b4e659b569bfe00cdd32f26c; Agent Evaluation run 28733003829 also completed success on the same branch and head. This docs-only head seals SignalR affected E2E evidence without changing business code.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 1
fatal: unable to access 'https://github.com/zenweb/AIMes.git/': Failed to connect to github.com port 443 after 21125 ms: Could not connect to server
```

## gh run

```text
Exit code: 0
completed	success	docs: seal signalr affected e2e evidence	CI	V1	push	28733003837	7m43s	2026-07-05T07:12:56Z
completed	success	docs: seal signalr affected e2e evidence	Agent Evaluation	V1	push	28733003829	2m32s	2026-07-05T07:12:56Z
completed	success	fix: use configured backend target for signalr hubs	Agent Evaluation	V1	push	28732673770	2m24s	2026-07-05T06:58:55Z
completed	success	fix: use configured backend target for signalr hubs	CI	V1	push	28732673767	7m25s	2026-07-05T06:58:55Z
completed	success	docs: seal anomaly dispatch live readback evidence	CI	V1	push	28732305177	7m41s	2026-07-05T06:42:18Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"e7eff755bff4b465b4e659b569bfe00cdd32f26c","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28733003837","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
