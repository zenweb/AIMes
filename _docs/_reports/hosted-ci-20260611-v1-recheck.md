# Hosted CI evidence recheck

- GeneratedAt: 2026-06-11T09:55:00+08:00
- Status: BLOCKED_BY_REMOTE_SYNC
- Repository: `zenweb/AIMes`
- GitHub default branch: `V1`
- Local branch: `V1`
- Local HEAD: `d8bb6e484f86a6fbd6673317385caf34ba774ee2`
- GitHub `V1` HEAD: `50c49cd4250570f1ca5903eef22b29014dd836b4`
- GitHub `main` HEAD: `cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74`

## Current Remote Evidence

- `gh auth status`: authenticated as `zenweb`, token scopes include `repo` and `workflow`.
- `gh repo view --json nameWithOwner,url,defaultBranchRef`: default branch is `V1`.
- `gh run list --repo zenweb/AIMes --workflow CI --branch V1 --limit 5`: returned no runs.
- `gh run list --repo zenweb/AIMes --workflow "Agent Evaluation" --branch V1 --limit 5`: returned no runs.
- `gh run list --repo zenweb/AIMes --limit 20`: latest successful hosted CI/Eval runs are on `main`, not `V1`.
- Latest visible CI run on `main`: `27090149991`, `success`, head `cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74`.
- Latest visible Agent Evaluation run on `main`: `27090149993`, `success`, head `cea7f57ca3c9bf3c6c494a96c735ee7872e6ec74`.

## Sync Attempt

```text
git push github V1:V1
fatal: unable to access 'https://github.com/zenweb/AIMes.git/': Failed to connect to github.com port 443 after 21124 ms: Could not connect to server
```

```text
ssh -T git@github.com
git@github.com: Permission denied (publickey).
```

```text
ssh -i ~/.ssh/aa -o IdentitiesOnly=yes -T git@github.com
git@github.com: Permission denied (publickey).
```

```text
gh ssh-key list
This API operation needs the "admin:public_key" scope.
```

```text
gh auth refresh -h github.com -s admin:public_key
Post "https://github.com/login/device/code": dial tcp 20.205.243.166:443: connectex: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond.
```

```text
gh api repos/zenweb/AIMes/git/commits/d8bb6e484f86a6fbd6673317385caf34ba774ee2
404 Not Found
```

## Gate Assessment

- A hosted runner PASS exists for `main`, but the GitHub default branch is `V1`.
- The GitHub `V1` branch does not have a current CI/Eval run.
- The local release-gate HEAD is not present in GitHub's object database and could not be pushed through the available Git transport.
- The local SSH key `~/.ssh/aa.pub` fingerprint is `SHA256:ig8/HELl51W0VVjhPqHmHWIiHtzlQBOk555r8N6wwbc`, but GitHub does not accept it for `git@github.com`.
- The current `gh` token can read repos/workflows but cannot manage SSH keys; refreshing `admin:public_key` is blocked by the same github.com 443 connectivity issue.
- The previous `_docs/_reports/hosted-ci-20260607.md` report remains historically true for `main`, but it is not sufficient proof for current `V1` release readiness.

## Required Next Action

- Restore a working Git push transport to `github.com`, or push from another environment.
- Practical unblock options:
  - Add `C:\Users\陈奕铭\.ssh\aa.pub` to GitHub SSH keys, then push with an SSH remote that bypasses the global HTTPS rewrite.
  - Re-run `gh auth refresh -h github.com -s admin:public_key` when github.com device login is reachable, then upload the key with `gh ssh-key add`.
  - Push `V1` from another machine/network where GitHub HTTPS or SSH is available.
- Push local `V1` to GitHub `V1`.
- Wait for both hosted workflows to complete:
  - `CI`
  - `Agent Evaluation`
- Replace this report with a PASS report only when both workflows succeed on the GitHub `V1` release branch.

## Gate

- Required evidence: hosted runner RunUrl, RunId, release branch, head SHA, and job summary for current `V1`.
- Result: FAIL
