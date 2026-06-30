# Hosted CI evidence

- GeneratedAt: 2026-06-30T21:43:56.0194439+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: a2e60121029e093db102dc9ca63d09f8cb2485f3
- HeadSha: a2e60121029e093db102dc9ca63d09f8cb2485f3
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28448378818
- RunId: 28448378818
- Evidence: GitHub Actions CI job summary: run 28448378818 completed success on V1 head a2e60121029e093db102dc9ca63d09f8cb2485f3; backend, frontend, security, and container jobs completed success. Agent Evaluation run 28448378837 also completed success on the same branch and head.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## GitHub ref verification

```text
Exit code: 0
gh api repos/zenweb/AIMes/git/ref/heads/V1 --jq .object.sha
a2e60121029e093db102dc9ca63d09f8cb2485f3
```

Note: Git over HTTPS to github.com:443 was unavailable from the local shell during this evidence refresh, so the branch ref was verified through api.github.com.

## gh run

```text
Exit code: 0
completed	success	test: align live backend evidence guard	Agent Evaluation	V1	push	28448378837	2m20s	2026-06-30T13:34:19Z
completed	success	test: align live backend evidence guard	CI	V1	push	28448378818	7m24s	2026-06-30T13:34:19Z
completed	success	ci: satisfy backend format gate	Agent Evaluation	V1	push	28447303499	2m8s	2026-06-30T13:17:49Z
completed	failure	ci: satisfy backend format gate	CI	V1	push	28447303273	4m51s	2026-06-30T13:17:48Z
completed	success	test(frontend): close live staging e2e skip gap	Agent Evaluation	V1	push	28446769957	2m1s	2026-06-30T13:09:16Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"a2e60121029e093db102dc9ca63d09f8cb2485f3","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28448378818","workflowName":"CI"}
```

## Agent Evaluation run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"a2e60121029e093db102dc9ca63d09f8cb2485f3","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28448378837","workflowName":"Agent Evaluation"}
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
