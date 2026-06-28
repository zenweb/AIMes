# 2026-06-14 Changelog - Release Gate 灰度后置重跑

## 变更
- 按 owner 指令去掉当前继续工作的灰度等待阻断，不等待 14/15 天观察窗口。
- 使用现有 `scripts/run-release-gate-audit.ps1 -DeferGrayObservation` 重跑总发布闸门审计。
- 生成当前报告 `_docs/_reports/release-gate-audit-20260614-gray-deferred-current-rerun.md`。

## 验证
- Hosted CI：PASS，证据 `_docs/_reports/hosted-ci-20260611-v1-pass.md`。
- PostgreSQL/staging：PASS，证据 `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`。
- Attack Chain A/B/C：PASS，证据 `_docs/_reports/attack-chain-verification-20260611-manual-verified.md`。
- Security signoff：PASS，证据 `_docs/_review/20260607-security-signoff.md`。
- Gray observation：DEFERRED_BY_OWNER。
- 总结果：`PASS_WITH_DEFERRED_GRAY_OBSERVATION`。

## 边界
- 该报告允许继续后续实现/审计工作。
- 该报告不是严格 v1.0.0 final release PASS；严格发布仍需真实灰度观察完整证据。
