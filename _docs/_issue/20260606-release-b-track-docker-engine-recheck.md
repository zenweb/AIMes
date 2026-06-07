# Issue: Release B-track 仍缺真实外部发布闸门证据

日期：2026-06-06

## 问题

在 `gh` 已登录、Docker Desktop engine 可启动后，B 轨道仍无法关闭：

- Hosted CI 缺真实 GitHub repo/Actions run。
- PostgreSQL/staging rehearsal 仍失败在外部依赖镜像拉取。
- Attack Chain A/B/C 缺人工验证。
- Security signoff 未签字。
- Gray observation 未开始。

## 当前证据

- `_docs/_reports/hosted-ci-20260606.md`：Result FAIL。
- `_docs/_reports/staging-rehearsal-20260606-docker-engine.md`：Result FAIL。
- `_docs/_reports/release-gate-audit-20260606-docker-engine.md`：Result FAIL。

## 影响

- v1.0.0 发布闸门不能关闭。
- A 轨道测试通过和覆盖率提升不能替代这些外部/人工/时间窗口证据。

## 状态

- 未阻塞继续做 A 轨道质量打磨。
- 阻塞 v1.0.0 release gate completion。
