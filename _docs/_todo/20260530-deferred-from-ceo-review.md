# 延后项（Repo-local Evidence Bridge）

> 完整 deferred list 位于 `C:\AIWorks\AIMes\_docs\_todo\20260530-deferred-from-ceo-review.md`。
> 本文件是 `v1` 仓库内的审计桥接页，避免当前实现仓库缺少 CEO review 延后项落点。

## Deferred Items

- E2 AI eval 平台化：移出 v1；v1 只保留 eval fail-closed 与 Agent 单测基础。
- E3 可观测性产品化：移出 v1；v1 保留 OTLP/OTel/健康检查接线。
- E4 审计防篡改（哈希链 + 查看器 UI）：移出 v1；v1 先稳定审计语义、事务和脱敏。
- 多副本能力打包：后续专项。
- CLAIMS.md 真伪 CI 门：后续专项。

## Current v1 Boundary

- v1.0.0 只关闭阶段一 `Sprint 0-3`、首次灰度和 14 天无 P0/P1。
- 不把 E2/E3/E4 作为 v1.0.0 发布阻断。
- 不删除 deferred items；只顺延到后续阶段或专项。

## Related Evidence

- Repo-local CC plan bridge: `_docs/_plan/20260514-cc-remediation-plan.md`。
- CEO plan source: `C:\Users\陈奕铭\.gstack\projects\AIMes\ceo-plans\2026-05-29-aimes-v1-remediation.md`。
- Release gate audit: `_docs/_reports/release-gate-audit-20260605.md` remains `Result: FAIL`.
