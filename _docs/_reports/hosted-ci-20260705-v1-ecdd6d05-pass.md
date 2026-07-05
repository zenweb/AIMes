# Hosted CI evidence

- GeneratedAt: 2026-07-05T16:41:52.5657908+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: ecdd6d05bf9bbe8ec729837259957de837546be1
- HeadSha: ecdd6d05bf9bbe8ec729837259957de837546be1
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28734854164
- RunId: 28734854164
- Evidence: GitHub Actions CI run 28734854164 completed success on V1 head ecdd6d05bf9bbe8ec729837259957de837546be1; Agent Evaluation run 28734854168 also completed success on the same branch and head. This docs-only head seals Schedule Agent Workbench API-unavailable fail-loud browser evidence without changing production code.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## git ls-remote

```text
Exit code: 0
ecdd6d05bf9bbe8ec729837259957de837546be1	refs/heads/V1
cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74	refs/heads/main
```

## gh run

```text
Exit code: 0
completed	success	docs: seal schedule agent api unavailable evidence	Agent Evaluation	V1	push	28734854168	2m3s	2026-07-05T08:31:14Z
completed	success	docs: seal schedule agent api unavailable evidence	CI	V1	push	28734854164	7m44s	2026-07-05T08:31:14Z
completed	success	docs: seal schedule agent 403 fail loud evidence	CI	V1	push	28734516513	7m40s	2026-07-05T08:17:26Z
completed	success	docs: seal schedule agent 403 fail loud evidence	Agent Evaluation	V1	push	28734516498	2m13s	2026-07-05T08:17:26Z
completed	success	docs: seal schedule rush writeback browser evidence	CI	V1	push	28734240740	7m43s	2026-07-05T08:05:48Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"ecdd6d05bf9bbe8ec729837259957de837546be1","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28734854164","workflowName":"CI"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
