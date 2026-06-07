# 2026-06-05 Plan - Audit Replay Assistant Payload Guard

## Success Criteria

- 使用覆盖率增量策略选择低覆盖且用户关键的审计回放组件。
- 后端助手动作审计返回非数组载荷时，基础回放卡仍可见。
- 同一场景必须通过 assertive alert 暴露坏载荷原因。
- 完成目标单测、lint、全量覆盖率验证。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：新增助手动作审计坏载荷回归测试。
- 已完成：目标单测 `13 tests passed`。
- 已完成：`npm run lint` 通过。
- 已完成：全量前端覆盖率 `489 tests passed`。

## Boundary

- 本计划推进 A-track 审计链路质量。
- B-track 发布闸门仍需外部/环境证据，不由本片替代。
