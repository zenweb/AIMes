# Review：Hosted CI run failure gate hardening

## 结论

Hosted CI 已经取得真实 GitHub Actions run 证据，但证据结论是 FAIL，不是 PASS。当前脚本会读取 `gh run view`，并要求 run completed 且 conclusion success，因此不会把失败 run 当成发布门禁通过。

## 已验证

- `scripts/run-hosted-ci-evidence.ps1` 对 run `27084449100` 退出码为 1。
- `_docs/_reports/hosted-ci-github-actions-failure-20260607.md` 写入 `gh run view` JSON：`status=completed`，`conclusion=failure`。
- `_docs/_reports/release-gate-audit-20260607-hosted-ci-failure.md` 将 Hosted CI 标记为 FAIL。
- 总发布门禁仍列出 5 个 FAIL gate。

## 残余风险

- CI workflow 本身仍失败：backend Restore、frontend Install dependencies、security NuGet dependency audit。
- `git ls-remote` 在本次脚本运行中仍出现 github.com 443 连接失败，但 `gh run list/view` 已取得 run 证据。
- 安全签字、Attack Chain 手工验证、staging rehearsal、灰度 14 天观察仍未关闭。
