# 2026-06-05 Plan - Document Upload Import Evidence Payload Guard

## Success Criteria

- 客户工单导入证据刷新返回坏载荷时，不能写入 `customerOrderImport`。
- 坏载荷不能渲染 `undefined 单高风险已识别`。
- 坏载荷必须通过 assertive alert 暴露具体原因。
- `null` 仍表示无后端记录/保留本地空态，不能被误判为错误。
- 修复后目标单测、lint、全量覆盖率全部通过。
- 同步 changelog、review、issue、plan、todo 五类文档。

## Result

- 已完成：新增坏载荷红灯测试。
- 已完成：新增客户工单导入证据响应守卫。
- 已完成：目标单测 `15 tests passed`。
- 已完成：`npm run lint` 通过。
- 已完成：全量前端覆盖率 `493 tests passed`。

## Boundary

- 本计划推进 A-track 知识库导入可靠性。
- B-track 发布闸门仍需外部/环境证据，不由本片替代。
