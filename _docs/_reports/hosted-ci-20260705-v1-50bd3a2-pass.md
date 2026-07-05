# Hosted CI evidence

- GeneratedAt: 2026-07-05T19:27:33.3568711+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: 50bd3a246d80aa8b09d96ff65f40fc45fed634ce
- HeadSha: 50bd3a246d80aa8b09d96ff65f40fc45fed634ce
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28738968191
- RunId: 28738968191
- Evidence: GitHub Actions CI run 28738968191 completed success for V1 head 50bd3a246d80aa8b09d96ff65f40fc45fed634ce; job summary includes backend, frontend, security, and container success.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 0
50bd3a246d80aa8b09d96ff65f40fc45fed634ce	refs/heads/V1
cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74	refs/heads/main
```

## gh run

```text
Exit code: 0
completed	success	docs: fix gray evidence wording guard	CI	V1	push	28738968191	7m20s	2026-07-05T11:17:33Z
completed	success	docs: fix gray evidence wording guard	Agent Evaluation	V1	push	28738968189	2m4s	2026-07-05T11:17:33Z
completed	failure	docs: align gray evidence request with repo-local requirement	CI	V1	push	28738779541	5m12s	2026-07-05T11:10:24Z
completed	success	docs: align gray evidence request with repo-local requirement	Agent Evaluation	V1	push	28738779538	2m17s	2026-07-05T11:10:24Z
completed	success	docs: refresh strict gray repo-local missing evidence	Agent Evaluation	V1	push	28738216673	2m19s	2026-07-05T10:48:15Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"50bd3a246d80aa8b09d96ff65f40fc45fed634ce","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28738968191","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
