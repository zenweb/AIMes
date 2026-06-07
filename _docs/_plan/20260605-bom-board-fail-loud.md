# 2026-06-05 BomBoard Fail-loud Plan

## A-track

- 已完成：按覆盖率杠杆从高覆盖 `QualityBoard.vue` 转向低覆盖且业务关键的 `BomBoard.vue`。
- 已完成：修复 BOM 爆炸接口失败时静默展示 demo fallback 的问题。
- 已完成：新增/扩展目标测试覆盖 `explodeBom()` 抛错时页面提示“BOM 展开失败”且仍展示 fallback 展开树。
- 已验证：目标 unit `1 file / 2 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 408 tests passed`；总行覆盖率 `74.19%`，`BomBoard.vue` 行覆盖率 `66.47%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复 BOM 列表接口失败时静默展示 demo fallback 的问题。
- 已完成：新增目标测试覆盖 `getBomList()` 抛错时页面提示“BOM 列表加载失败”且仍展示 fallback BOM 清单。
- 已验证：目标 unit `1 file / 3 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 409 tests passed`；总行覆盖率 `74.24%`，`BomBoard.vue` 行覆盖率 `69.18%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复 BOM 详情接口失败时静默展示 demo fallback 的问题。
- 已完成：新增目标测试覆盖 `getBomById()` 抛错时页面提示“BOM 详情加载失败”且仍展示 fallback BOM 详情。
- 已验证：目标 unit `1 file / 4 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 410 tests passed`；总行覆盖率 `74.31%`，`BomBoard.vue` 行覆盖率 `72.41%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复替代料放行写入失败时没有页面级失败反馈的问题。
- 已完成：新增目标测试覆盖 `writeAlternateMaterialApproval()` 抛错时页面提示“替代料放行失败”且保持替代料待确认。
- 已验证：目标 unit `1 file / 5 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 411 tests passed`；总行覆盖率 `74.30%`，`BomBoard.vue` 行覆盖率 `72.37%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复 ECN 影响分析写入失败时没有页面级失败反馈的问题。
- 已完成：新增目标测试覆盖 `writeEngineeringChangeImpactAnalysis()` 抛错时页面提示“ECN 影响分析失败”且保持工程变更未分析状态。
- 已验证：目标 unit `1 file / 6 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 412 tests passed`；总行覆盖率 `74.30%`，`BomBoard.vue` 行覆盖率 `72.34%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复 BOM 齐套检查包写入失败时没有页面级失败反馈的问题。
- 已完成：新增目标测试覆盖 `writeBomKittingPackage()` 抛错时页面提示“BOM 齐套检查包发布失败”且保持齐套包未发布。
- 已验证：目标 unit `1 file / 7 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 413 tests passed`；总行覆盖率 `74.38%`，`BomBoard.vue` 行覆盖率 `75.91%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复 ECN 批准/驳回写入失败时没有页面级失败反馈的问题。
- 已完成：新增目标测试覆盖 `approveEngineeringChangeImpactAnalysis()` 和 `rejectEngineeringChangeImpactAnalysis()` 抛错时页面提示对应 ECN 决策失败，并保持 pending 状态。
- 已验证：目标 unit `1 file / 9 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 415 tests passed`；总行覆盖率 `74.44%`，`BomBoard.vue` 行覆盖率 `78.53%`。
- 已验证：`npm run lint` 通过。
- 下一步：继续 `BomBoard.vue` 时优先查后端读取失败 fail-loud；若覆盖收益更高，也可转向同等关键且更低覆盖的 `PurchaseBoard.vue`、`EmployeeBoard.vue`。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- `gh` 已登录 `zenweb` 且具备 `repo/workflow` scope；当前远端仍是腾讯工蜂，`zenweb/AIMes` GitHub 仓库不可解析，不能把 hosted CI 视为完成。
- 不用本片前端单测结果替代发布闸门证据。
