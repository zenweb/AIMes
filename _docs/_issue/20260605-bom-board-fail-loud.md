# 2026-06-05 BomBoard Fail-loud Issues

## Fixed

- 问题：`BomBoard.vue` 的 BOM 爆炸接口失败时静默展示 demo fallback 展开树。
- 风险：计划员或物控可能把 demo 的 MAT-A01 等物料展开结果当成真实 BOM 展开结果，影响库存齐套、替代料释放和排产约束判断。
- 处理：`handleExplode()` 捕获 `explodeBom()` 错误，通过 assertive alert 提示“BOM 展开失败”及底层错误，同时保留 fallback 展开树维持页面可用。
- 验证：目标 unit `1 file / 2 tests passed`，全量前端 unit coverage `81 files / 408 tests passed`，lint 通过。

- 问题：`BomBoard.vue` 的 BOM 列表接口失败时静默展示 demo fallback 清单。
- 风险：计划员可能把 demo 的 BOM-A100/BOM-B200/BOM-C300 当成真实工程主数据清单，影响详情、齐套和排产后续判断。
- 处理：`loadBoms()` 捕获 `getBomList()` 错误，通过 assertive alert 提示“BOM 列表加载失败”及底层错误，同时保留 fallback BOM 列表维持页面可用。
- 验证：目标 unit `1 file / 3 tests passed`，全量前端 unit coverage `81 files / 409 tests passed`，lint 通过。

- 问题：`BomBoard.vue` 的 BOM 详情接口失败时静默展示 demo fallback 详情。
- 风险：计划员可能把 demo 物料项、版本和工程约束当成真实 BOM 详情，继续触发替代料、ECN、齐套和排产动作。
- 处理：`selectBom()` 捕获 `getBomById()` 错误，通过 assertive alert 提示“BOM 详情加载失败”及底层错误，同时保留 fallback BOM 详情维持页面可用。
- 验证：目标 unit `1 file / 4 tests passed`，全量前端 unit coverage `81 files / 410 tests passed`，lint 通过。

- 问题：`BomBoard.vue` 的替代料放行写入失败时没有页面级失败反馈。
- 风险：计划员可能误以为 M-AL-6061B 已工程放行，但审批记录和 OTD 证据链实际未持久化。
- 处理：`approveAlternateMaterial()` 捕获 `writeAlternateMaterialApproval()` 错误，通过 assertive alert 提示“替代料放行失败”及底层错误；写入返回 `null` 时提示重试并保持待确认状态。
- 验证：目标 unit `1 file / 5 tests passed`，全量前端 unit coverage `81 files / 411 tests passed`，lint 通过。

- 问题：`BomBoard.vue` 的 ECN 影响分析写入失败时没有页面级失败反馈。
- 风险：计划员可能误以为工程变更影响分析已生成，但 ECN 证据、审计号和后续批准/驳回状态实际未持久化。
- 处理：`analyzeEngineeringChangeImpact()` 捕获 `writeEngineeringChangeImpactAnalysis()` 错误，通过 assertive alert 提示“ECN 影响分析失败”及底层错误；写入返回 `null` 时提示重试并保持未分析状态。
- 验证：目标 unit `1 file / 6 tests passed`，全量前端 unit coverage `81 files / 412 tests passed`，lint 通过。

- 问题：`BomBoard.vue` 的 BOM 齐套检查包写入失败时没有页面级失败反馈。
- 风险：计划员可能误以为 BOM 缺料齐套包已进入库存和 OTD 证据链，但真实齐套包或证据链持久化失败。
- 处理：`publishBomKittingPackage()` 捕获 `writeBomKittingPackage()` 和 OTD 证据链写入错误，通过 assertive alert 提示“BOM 齐套检查包发布失败”及底层错误，并保持未发布状态。
- 验证：目标 unit `1 file / 7 tests passed`，全量前端 unit coverage `81 files / 413 tests passed`，lint 通过。

- 问题：`BomBoard.vue` 的 ECN 批准/驳回写入失败时没有页面级失败反馈。
- 风险：工程经理可能误以为工程变更决策已生效，但决策审计号、排产准入状态和后续证据链实际未持久化。
- 处理：`approveEngineeringChange()` 和 `rejectEngineeringChange()` 捕获决策写入错误，通过 assertive alert 提示“ECN 放行失败”或“ECN 驳回失败”及底层错误，并保持 pending 决策状态。
- 验证：目标 unit `1 file / 9 tests passed`，全量前端 unit coverage `81 files / 415 tests passed`，lint 通过。

## Remaining

- `BomBoard.vue` 仍有未覆盖分支，后续继续按“低覆盖 + 用户必经 + 业务关键”选择真实行为缺口；若继续本组件，优先审查后端读取失败 fail-loud 或转向同等关键且更低覆盖组件。
- B-track 发布门仍缺真实 GitHub repo/Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 外部证据：`gh auth status` 已确认 `zenweb` 登录，scope 包含 `repo/workflow`；但当前 `origin` 是 `https://git.code.tencent.com/zenweb/AIMes.git`，`gh repo view zenweb/AIMes` 返回仓库不可解析。
