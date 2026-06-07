# 2026-06-05 BomBoard Next Actions

## Done

- 已完成：`BomBoard.vue` BOM 爆炸接口失败时 fail loud，避免 demo 展开树被误读为真实 BOM 展开结果。
- 已完成：扩展目标测试覆盖 `explodeBom()` 抛错时页面提示“BOM 展开失败”并继续显示 fallback 物料树。
- 已完成：`BomBoard.vue` BOM 列表接口失败时 fail loud，避免 demo BOM 清单被误读为真实工程主数据。
- 已完成：新增目标测试覆盖 `getBomList()` 抛错时页面提示“BOM 列表加载失败”并继续显示 fallback BOM 清单。
- 已完成：`BomBoard.vue` BOM 详情接口失败时 fail loud，避免 demo BOM 详情被误读为真实工程主数据。
- 已完成：新增目标测试覆盖 `getBomById()` 抛错时页面提示“BOM 详情加载失败”并继续显示 fallback BOM 详情。
- 已完成：`BomBoard.vue` 替代料放行写入失败时 fail loud，避免未持久化审批被误认为已生效。
- 已完成：新增目标测试覆盖 `writeAlternateMaterialApproval()` 抛错时页面提示“替代料放行失败”并保持待确认状态。
- 已完成：`BomBoard.vue` ECN 影响分析写入失败时 fail loud，避免未持久化工程变更分析被误认为已生成。
- 已完成：新增目标测试覆盖 `writeEngineeringChangeImpactAnalysis()` 抛错时页面提示“ECN 影响分析失败”并保持未分析状态。
- 已完成：`BomBoard.vue` BOM 齐套检查包写入失败时 fail loud，避免未持久化齐套包被误认为已进入库存和排产复核。
- 已完成：新增目标测试覆盖 `writeBomKittingPackage()` 抛错时页面提示“BOM 齐套检查包发布失败”并保持未发布状态。
- 已完成：`BomBoard.vue` ECN 批准/驳回写入失败时 fail loud，避免未持久化决策被误认为已生效。
- 已完成：新增目标测试覆盖 ECN 批准和驳回抛错时页面提示对应失败并保持 pending 决策状态。

## Continue

- 继续：`BomBoard.vue` 后续优先查后端读取失败 fail-loud；若覆盖收益更高，可转向同等关键且更低覆盖组件。
- 继续：按“覆盖率最低且用户必经”选择后续切片，避免回到已高覆盖组件做低收益精修。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- `gh` 认证已可用；仍需决定是否创建/绑定 GitHub 仓库或继续使用腾讯工蜂侧 CI，当前不能把 hosted CI 证据记为完成。
