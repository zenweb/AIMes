# 2026-06-05 BomBoard Fail-loud Review

## BomBoard Explosion Fallback Fail-loud Review

- 审计结论：本片修复 BOM 爆炸接口失败时静默展示 demo fallback 的问题，避免演示展开树被误读为真实工程主数据。
- 行为覆盖：`explodeBom()` 抛错后，页面仍显示 fallback 展开树，同时必须显示 `[role="alert"]`，包含“BOM 展开失败”和底层错误。
- 行为保持：成功展开路径不变；失败时继续保持页面可用，但明确暴露真实后端不可用。
- TDD 证据：测试先失败于找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 2 tests passed`；全量前端 unit coverage `81 files / 408 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.19%`，`BomBoard.vue` 行覆盖率 `66.47%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## BomBoard List Fallback Fail-loud Review

- 审计结论：本片修复 BOM 列表接口失败时静默展示 demo fallback 的问题，避免演示 BOM 清单被误读为真实工程主数据入口。
- 行为覆盖：`getBomList()` 抛错后，页面仍显示本地 BOM 记录，同时必须显示 `[role="alert"]`，包含“BOM 列表加载失败”和底层错误。
- 行为保持：成功列表加载路径不变；失败时继续保持页面可用，但明确暴露真实后端不可用。
- TDD 证据：测试先失败于找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 3 tests passed`；全量前端 unit coverage `81 files / 409 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.24%`，`BomBoard.vue` 行覆盖率 `69.18%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## BomBoard Detail Fallback Fail-loud Review

- 审计结论：本片修复 BOM 详情接口失败时静默展示 demo fallback 的问题，避免演示物料项和工程约束被误读为真实 BOM 详情。
- 行为覆盖：`getBomById()` 抛错后，页面仍显示本地 BOM 详情，同时必须显示 `[role="alert"]`，包含“BOM 详情加载失败”和底层错误。
- 行为保持：成功详情加载路径不变；失败时继续保持页面可用，但明确暴露真实后端不可用。
- TDD 证据：测试先失败于找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 4 tests passed`；全量前端 unit coverage `81 files / 410 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.31%`，`BomBoard.vue` 行覆盖率 `72.41%`。
- 发布边界：`gh` 认证已可用，但 GitHub 仓库 `zenweb/AIMes` 当前不可解析；Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察仍缺真实证据。

## BomBoard Alternate Approval Write Fail-loud Review

- 审计结论：本片修复替代料放行写入失败时无页面反馈的问题，避免用户把未持久化的工程放行误认为已生效。
- 行为覆盖：`writeAlternateMaterialApproval()` 抛错后，页面仍显示“M-AL-6061B 等待工程确认”，同时必须显示 `[role="alert"]`，包含“替代料放行失败”和底层错误。
- 行为保持：成功写入路径不变；成功时只清理同类旧“替代料放行失败”告警，不清理列表、详情或展开错误。
- TDD 证据：测试先失败于未捕获 native event handler 错误且找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 5 tests passed`；全量前端 unit coverage `81 files / 411 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.30%`，`BomBoard.vue` 行覆盖率 `72.37%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## BomBoard ECN Impact Write Fail-loud Review

- 审计结论：本片修复 ECN 影响分析写入失败时无页面反馈的问题，避免用户把未持久化的工程变更分析误认为已生成。
- 行为覆盖：`writeEngineeringChangeImpactAnalysis()` 抛错后，页面仍显示“替代料变更先算影响再进排产”，同时必须显示 `[role="alert"]`，包含“ECN 影响分析失败”和底层错误。
- 行为保持：成功分析路径不变；成功时只清理同类旧“ECN 影响分析失败”告警，不清理列表、详情、展开或替代料错误。
- TDD 证据：测试先失败于未捕获 native event handler 错误且找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 6 tests passed`；全量前端 unit coverage `81 files / 412 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.30%`，`BomBoard.vue` 行覆盖率 `72.34%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## BomBoard Kitting Package Write Fail-loud Review

- 审计结论：本片修复 BOM 齐套检查包发布失败时无页面反馈的问题，避免用户把未持久化的齐套包误认为已进入库存和排产复核。
- 行为覆盖：`writeBomKittingPackage()` 抛错后，页面仍显示“把 BOM 展开结果送入库存齐套”，同时必须显示 `[role="alert"]`，包含“BOM 齐套检查包发布失败”和底层错误。
- 行为保持：成功发布路径不变；成功时只清理同类旧“BOM 齐套检查包发布失败”告警，不清理列表、详情、展开、替代料或 ECN 错误。
- TDD 证据：测试先失败于未捕获 native event handler 错误且找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 7 tests passed`；全量前端 unit coverage `81 files / 413 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.38%`，`BomBoard.vue` 行覆盖率 `75.91%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## BomBoard ECN Decision Write Fail-loud Review

- 审计结论：本片修复 ECN 批准/驳回写入失败时无页面反馈的问题，避免用户把未持久化的 ECN 决策误认为已生效。
- 行为覆盖：批准写入抛错后页面仍显示“待工程批准”，同时显示 `[role="alert"]`，包含“ECN 放行失败”和底层错误；驳回写入抛错后同理显示“ECN 驳回失败”。
- 行为保持：成功批准/驳回路径不变；成功时只清理同类旧 ECN 决策告警，不清理列表、详情、展开、替代料、ECN 分析或齐套错误。
- TDD 证据：两个测试先失败于未捕获 native event handler 错误且找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 9 tests passed`；全量前端 unit coverage `81 files / 415 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.44%`，`BomBoard.vue` 行覆盖率 `78.53%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。
