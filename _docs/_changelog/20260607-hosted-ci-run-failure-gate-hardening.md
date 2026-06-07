# 2026-06-07 Hosted CI run failure gate hardening

## 变更

- 使用 GitHub Actions 真实 hosted runner 失败 run 反向验证 Hosted CI evidence gate。
- 将 `scripts/run-hosted-ci-evidence.ps1` 的判定要求固定为 `gh run view` 必须返回 `status=completed` 且 `conclusion=success`。
- 生成失败证据报告：`_docs/_reports/hosted-ci-github-actions-failure-20260607.md`。
- 生成汇总门禁审计：`_docs/_reports/release-gate-audit-20260607-hosted-ci-failure.md`。

## 结果

- CI run `27084449100` 已由 GitHub Actions hosted runner 执行完成。
- 该 run 的 `conclusion` 为 `failure`，不能关闭 Hosted CI release gate。
- B-track 发布门禁仍为 FAIL：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度观察均未 PASS。

## 边界

- 本轮未修改产品功能代码。
- 本轮目标是防止失败的 hosted CI run 被误判为 PASS。
