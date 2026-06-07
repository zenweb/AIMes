# 2026-06-06 B 轨发布闸门复检

## Changed

- 复检 Hosted CI、PostgreSQL/staging 和 aggregate release gate。
- 确认 `gh auth` 已登录，但当前仓库 remote 仍不是 GitHub，`gh run list` 无法绑定 Actions base repo。
- 启动 Docker Desktop Linux Engine，并确认 daemon 可用。
- 修复 `scripts/run-staging-rehearsal.ps1` 的 Missing 镜像检测，让报告能继续记录真实 `docker pull` 代理/镜像源失败原因。

## Tests

- `scripts/run-hosted-ci-evidence.ps1`：FAIL，生成 `_docs/_reports/hosted-ci-20260606-gh-auth-recheck.md`。
- `scripts/run-staging-rehearsal.ps1`：FAIL，生成 `_docs/_reports/staging-rehearsal-20260606-docker-proxy-recheck.md`。
- `scripts/run-release-gate-audit.ps1`：FAIL，生成 `_docs/_reports/release-gate-audit-20260606-b-track-recheck.md`。

## Notes

- B 轨闸门未关闭。
- Hosted CI 需要 GitHub remote/Actions run evidence。
- Staging 需要 Docker Desktop 可用 HTTPS proxy/registry mirror，或预拉依赖镜像。
