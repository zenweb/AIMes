# Hosted CI evidence

- GeneratedAt: 2026-06-21T14:17:42.9750114+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: 47d65547557a8a6cf035327ae94455a1a1285daf
- HeadSha: 47d65547557a8a6cf035327ae94455a1a1285daf
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27848757617
- RunId: 27848757617
- Evidence: GitHub Actions CI run 27848757617 completed success on V1 head 47d65547557a8a6cf035327ae94455a1a1285daf; Agent Evaluation run 27848757651 also completed success on the same branch and head.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 0
47d65547557a8a6cf035327ae94455a1a1285daf	refs/heads/V1
cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74	refs/heads/main
```

## gh run

```text
Exit code: 0
completed	success	Refresh release gate evidence for live preview fix	Agent Evaluation	V1	push	27848757651	2m12s	2026-06-19T21:14:39Z
completed	success	Refresh release gate evidence for live preview fix	CI	V1	push	27848757617	7m35s	2026-06-19T21:14:39Z
completed	success	Fix live preview employee login entry	CI	V1	push	27848203224	7m5s	2026-06-19T20:59:42Z
completed	success	Fix live preview employee login entry	Agent Evaluation	V1	push	27848203222	1m56s	2026-06-19T20:59:42Z
completed	success	Record latest V1 hosted CI pass evidence	Agent Evaluation	V1	push	27846825028	2m0s	2026-06-19T20:23:45Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"47d65547557a8a6cf035327ae94455a1a1285daf","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/27848757617","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
