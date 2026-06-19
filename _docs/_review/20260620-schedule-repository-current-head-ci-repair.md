# 2026-06-20 Review - Schedule Repository Current Head CI Repair

## Findings
- CI 新失败不是 RabbitMQ 修复回退，而是 solution build 继续向前后暴露 integration test 对 `GetByIdForUpdateAsync` 的依赖。
- 写路径需要 tracked entity，`GetByIdAsync` 维持 `AsNoTracking()` 读模型，新增 `GetByIdForUpdateAsync` 保持职责分离。
- 变更范围限定在仓储合约和实现，没有扩大排产业务行为。

## Residual Risk
- 仍需新的 hosted CI/Agent Evaluation run 证明远端当前 head 通过。
