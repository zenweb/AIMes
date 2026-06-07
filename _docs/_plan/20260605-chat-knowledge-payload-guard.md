# 2026-06-05 Plan - Chat Knowledge Payload Guard

## Success Criteria

- 知识问答接口返回坏载荷时不能触发渲染崩溃。
- 坏载荷必须进入现有离线演示 fallback。
- 用户必须看到 assertive alert 和具体坏载荷原因。
- 修复后目标单测、lint、全量覆盖率全部通过。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：新增知识问答坏载荷红灯测试。
- 已完成：最小实现知识问答响应载荷守卫。
- 已完成：目标单测 `34 tests passed`。
- 已完成：`npm run lint` 通过。
- 已完成：全量前端覆盖率 `491 tests passed`。

## Boundary

- 本计划推进 A-track AI 助手主入口可靠性。
- B-track 发布闸门仍需外部/环境证据，不由本片替代。
