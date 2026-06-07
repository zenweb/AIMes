# 2026-06-05 Plan - Chat History Payload Guard

## Success Criteria

- 使用覆盖率增量选择低覆盖且用户关键的 `ChatPanel.vue`。
- 聊天历史返回坏载荷时不能静默显示空状态。
- 坏载荷必须通过 assertive alert 暴露具体原因。
- 修复后目标单测、lint、全量覆盖率全部通过。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：新增聊天历史坏载荷红灯测试。
- 已完成：最小实现聊天历史载荷守卫。
- 已完成：目标单测 `33 tests passed`。
- 已完成：`npm run lint` 通过。
- 已完成：全量前端覆盖率 `490 tests passed`。

## Boundary

- 本计划推进 A-track AI 助手主入口可靠性。
- B-track 发布闸门仍需外部/环境证据，不由本片替代。
