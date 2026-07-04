# Hosted CI evidence

- GeneratedAt: 2026-06-30T22:02:00+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: ca7e4b7001eb9861e905ac958ebcd32fd19dede9
- HeadSha: ca7e4b7001eb9861e905ac958ebcd32fd19dede9
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/28449631527
- RunId: 28449631527
- Evidence: GitHub Actions CI job summary: run 28449631527 completed success on V1 head ca7e4b7001eb9861e905ac958ebcd32fd19dede9; backend, frontend, security, and container jobs completed success. Agent Evaluation run 28449632371 also completed success on the same branch and head. CI/Eval logs no longer contain `No url found for submodule path` or `git failed with exit code 128`.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## GitHub ref verification

```text
Exit code: 0
gh api repos/zenweb/AIMes/git/ref/heads/V1 --jq .object.sha
ca7e4b7001eb9861e905ac958ebcd32fd19dede9
```

## gh run

```text
Exit code: 0
completed	success	chore: record hosted ci evidence and clean tmp gitlinks	Agent Evaluation	V1	push	28449632371	2m20s	2026-06-30T13:53:24Z
completed	success	chore: record hosted ci evidence and clean tmp gitlinks	CI	V1	push	28449631527	7m24s	2026-06-30T13:53:23Z
completed	success	test: align live backend evidence guard	Agent Evaluation	V1	push	28448378837	2m20s	2026-06-30T13:34:19Z
completed	success	test: align live backend evidence guard	CI	V1	push	28448378818	7m24s	2026-06-30T13:34:19Z
```

## gh run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"ca7e4b7001eb9861e905ac958ebcd32fd19dede9","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28449631527","workflowName":"CI"}
```

## Agent Evaluation run view

```text
Exit code: 0
{"conclusion":"success","headBranch":"V1","headSha":"ca7e4b7001eb9861e905ac958ebcd32fd19dede9","status":"completed","url":"https://github.com/zenweb/AIMes/actions/runs/28449632371","workflowName":"Agent Evaluation"}
```

## Log annotation check

```text
Exit code: 0
gh run view 28449631527 --repo zenweb/AIMes --log | Select-String -Pattern 'No url found for submodule path','git.*failed with exit code 128','fatal:' -CaseSensitive
<no matches>

gh run view 28449632371 --repo zenweb/AIMes --log | Select-String -Pattern 'No url found for submodule path','git.*failed with exit code 128','fatal:' -CaseSensitive
<no matches>
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary.
- Result: PASS
