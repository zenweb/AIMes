# 2026-06-05 Plan - Document Upload Payload Guard

## Success Criteria

- 上传接口返回坏载荷时不能标记为已上传。
- 上传接口返回坏载荷时不能写入坏历史。
- 坏载荷必须通过行级 assertive alert 暴露具体原因。
- 修复后目标单测、lint、全量覆盖率全部通过。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：新增上传坏载荷红灯测试。
- 已完成：最小实现上传响应载荷守卫。
- 已完成：目标单测 `14 tests passed`。
- 已完成：`npm run lint` 通过。
- 已完成：全量前端覆盖率 `492 tests passed`。

## Boundary

- 本计划推进 A-track 知识库导入可靠性。
- B-track 发布闸门仍需外部/环境证据，不由本片替代。
