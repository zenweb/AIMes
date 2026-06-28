# 2026-06-14 Issue - 灰度观察不应阻断当前继续工作

## Problem
- 严格 v1.0.0 发布门要求首次灰度后至少 14 天且 P0/P1=0。
- owner 明确要求跳过该等待，不把灰度观察作为当前继续工作的阻断项。
- 如果只看默认 release gate 审计，Gray observation 仍会显示 FAIL，容易误判当前无法继续实现/审计。

## Resolution
- 使用现有 `-DeferGrayObservation` 参数重跑总审计。
- 结果以 `PASS_WITH_DEFERRED_GRAY_OBSERVATION` 记录当前可继续状态。
- 报告正文保留“不是严格 v1.0.0 final release PASS”的边界。

## Verification
- `_docs/_reports/release-gate-audit-20260614-gray-deferred-current-rerun.md` 显示：
- Hosted CI / PostgreSQL-staging / Attack Chain A-B-C / Security signoff：PASS。
- Gray observation：DEFERRED_BY_OWNER。
- Result：PASS_WITH_DEFERRED_GRAY_OBSERVATION。
