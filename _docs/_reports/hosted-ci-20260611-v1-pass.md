# Hosted CI evidence

- GeneratedAt: 2026-06-11T10:00:00+08:00
- Status: READY_FOR_RELEASE_REVIEW
- RemoteName: github
- Repository: zenweb/AIMes
- Branch: V1
- CommitSha: d8bb6e484f86a6fbd6673317385caf34ba774ee2
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27318467207
- RunId: 27318467207
- Evidence: job summary confirms CI success on GitHub V1 for head d8bb6e484f86a6fbd6673317385caf34ba774ee2; Agent Evaluation run 27318467206 also concluded success on the same branch and head.

## Local workflow files

- .github/workflows/ci.yml: True
- .github/workflows/eval.yml: True

## CI run

- Workflow: CI
- Status: completed
- Conclusion: success
- Branch: V1
- HeadSha: d8bb6e484f86a6fbd6673317385caf34ba774ee2
- RunId: 27318467207
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27318467207

### CI jobs

| Job | Status | Conclusion |
| --- | --- | --- |
| backend | completed | success |
| frontend | completed | success |
| security | completed | success |
| container | completed | success |

## Agent Evaluation run

- Workflow: Agent Evaluation
- Status: completed
- Conclusion: success
- Branch: V1
- HeadSha: d8bb6e484f86a6fbd6673317385caf34ba774ee2
- RunId: 27318467206
- RunUrl: https://github.com/zenweb/AIMes/actions/runs/27318467206

### Agent Evaluation jobs

| Job | Status | Conclusion |
| --- | --- | --- |
| evaluate | completed | success |

## GitHub V1 evidence readiness

- Report: `_docs/_reports/github-v1-push-readiness-20260611-after-ci-pass.md`
- Result: PASS
- Note: hosted CI evidence is complete for current `V1`; future pushes may still need stable HTTPS connectivity or an accepted SSH key.

## gh run

```text
Exit code: 0
completed	success	Refresh B-track prerequisite status	CI	V1	push	27318467207	6m42s	2026-06-11T01:51:20Z
completed	success	Refresh B-track prerequisite status	Agent Evaluation	V1	push	27318467206	2m08s	2026-06-11T01:51:20Z
```

## Gate

- Required evidence: hosted runner RunUrl, RunId, release branch, head SHA, and job summary.
- Result: PASS
