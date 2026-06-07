# 2026-06-07 Hosted CI Latest Refresh Evidence

## Scope

- Target report: `_docs/_reports/hosted-ci-20260607.md`.
- Goal: refresh Hosted CI evidence to latest remote main.

## Evidence

- Remote main: `3ac45a0b001981f528db359aedf115ad341addc0`.
- CI run: `27089650107`, conclusion `success`.
- Agent Evaluation run: `27089650108`, conclusion `success`.
- CI URL: `https://github.com/zenweb/AIMes/actions/runs/27089650107`.
- Agent Evaluation URL: `https://github.com/zenweb/AIMes/actions/runs/27089650108`.

## Verification

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-hosted-ci-evidence.ps1 `
  -ReportPath _docs/_reports/hosted-ci-20260607.md `
  -RemoteName github `
  -CommitSha 3ac45a0b001981f528db359aedf115ad341addc0 `
  -RunUrl https://github.com/zenweb/AIMes/actions/runs/27089650107 `
  -RunId 27089650107 `
  -Evidence "CI success: backend, frontend, security, and container jobs concluded success at remote main 3ac45a0b001981f528db359aedf115ad341addc0; Agent Evaluation run 27089650108 concluded success."
```

Result: `PASS`.

## Boundary

Hosted CI remains closed, but PostgreSQL/staging, Attack Chain manual verification, security signoff, and gray observation remain open.
