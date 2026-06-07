# 2026-06-06 Release B-track Next Actions

## Done

- 已完成：确认 `gh` 登录可用，账号 `zenweb`，具备 `repo` / `workflow` scope。
- 已完成：确认当前 Git remote 仍不是 GitHub remote。
- 已完成：确认 GitHub 上 `zenweb/AIMes` 不存在或不可见。
- 已完成：生成 `_docs/_reports/hosted-ci-github-actions-evidence-20260606.md`，Hosted CI gate 继续 fail loud。
- 已完成：确认 Docker engine 可用。
- 已完成：复跑 staging rehearsal，卡在 `postgres:16-alpine` 镜像拉取。
- 已完成：复跑 Hosted CI evidence 与 release gate audit，结果均 fail loud。
- 已完成：运行 `_docs/_reports/attack-chain-automated-evidence-20260606.md`，自动攻击链支持证据 PASS，但不替代人工验证。
- 已完成：运行 `_docs/_reports/security-self-assessment-20260606-local.md`，自动安全自评 PASS，但不替代人工 signoff。

## Needs User / External Environment

- Hosted CI:
  - 创建或提供 GitHub 仓库，例如 `zenweb/AIMes`。
  - 将当前代码推到该 GitHub 仓库，或添加 GitHub remote。
  - 触发 GitHub Actions run。
  - 提供 run URL、run id 和 job summary，或让我在 repo 可见后读取。
- PostgreSQL/staging:
  - 配置 Docker Desktop 可访问 Docker Hub 的代理/镜像源，或手动预拉：
    - `postgres:16-alpine`
    - `redis:7-alpine`
    - `rabbitmq:4-management-alpine`
    - `qdrant/qdrant:latest`
  - 预拉完成后重跑 `scripts/run-staging-rehearsal.ps1`。
- Attack Chain A/B/C:
  - 可参考 `_docs/_reports/attack-chain-automated-evidence-20260606.md` 作为自动支持证据。
  - 最新人工验证入口：`_docs/_reports/attack-chain-verification-20260606.md`，当前仍 FAIL。
  - 人工执行 A/B/C 验证。
  - 补 verifier、VerifiedAt 和每条攻击链证据。
- Security signoff:
  - 可参考 `_docs/_reports/security-self-assessment-20260606-local.md` 作为自动自评证据。
  - 人类 signer 在攻击链证据齐全后签署。
- Gray observation:
  - 完成首次灰度。
  - 记录 14 calendar days 且 P0/P1 = 0 的观察证据。

## Next Codex Work

- 在外部发布环境未补齐前，继续 A 轨质量杠杆切片。
- 下一片优先在 `ScheduleBoard.vue`、`ChatPanel.vue`、`DocumentUpload.vue`、`AuditDecisionReplayPanel.vue` 中按覆盖率增量和业务关键度选择。
