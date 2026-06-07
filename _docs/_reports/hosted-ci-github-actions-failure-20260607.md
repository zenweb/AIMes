# Hosted CI evidence

- GeneratedAt: 2026-06-07T14:24:05.9066006+08:00
- Status: MISSING_REMOTE_RUN
- RemoteName: github
- CommitSha: 50c49cd4250570f1ca5903eef22b29014dd836b4
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27084449100
- RunId: 27084449100
- Evidence: GitHub Actions hosted runner job summary: CI run 27084449100 completed with conclusion failure; backend Restore, frontend Install dependencies, and security NuGet dependency audit failed.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 1
fatal: unable to access 'https://github.com/zenweb/AIMes.git/': Failed to connect to github.com port 443 after 21150 ms: Could not connect to server
```

## gh run

```text
Exit code: 0
completed	failure	Let assistant create BOM kitting packages	CI	main	push	27084449100	29s	2026-06-07T06:02:52Z
completed	failure	Let assistant create BOM kitting packages	Agent Evaluation	main	push	27084449085	12s	2026-06-07T06:02:52Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"failure","headBranch":"main","headSha":"50c49cd4250570f1ca5903eef22b29014dd836b4","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27084449100","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, and job summary.
- Result: FAIL

## Violations

- Hosted CI run must be completed with conclusion success.

This report cannot close the hosted CI release gate.
