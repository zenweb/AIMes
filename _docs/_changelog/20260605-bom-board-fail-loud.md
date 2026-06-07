# 2026-06-05 BomBoard Fail-loud Changelog

## BomBoard Explosion Fallback Fail-loud Slice

- 选片依据：从 `QualityBoard.vue` 转向低覆盖且用户必经的 `BomBoard.vue`；BOM 爆炸展开是生产、库存齐套和排产引用的前置主数据动作。
- 问题：`explodeBom()` 抛错时页面静默展示 demo 展开树，没有告知真实 BOM 展开接口不可用。
- 风险：计划员或物控可能把 demo 物料展开结果当成真实 BOM 计算结果，影响齐套、替代料和排产风险判断。
- 修复：新增页面级 assertive alert；`handleExplode()` 失败时提示“BOM 展开失败”并展示底层错误，同时保留本地 demo 展开树维持页面可用。
- 行为保持：BOM 展开成功路径不变；成功时只清理同类旧“BOM 展开失败”告警。
- 测试：扩展 TDD 用例 `alerts while falling back to a local explosion tree when BOM explosion fails asynchronously`，先红于 fallback 树存在但找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1 file / 2 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 408 tests passed`，总行覆盖率 `74.19%`，`BomBoard.vue` 行覆盖率 `66.47%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## BomBoard List Fallback Fail-loud Slice

- 选片依据：继续 `BomBoard.vue` 的第一屏主数据入口；BOM 列表是计划员进入详情、展开齐套和排产引用的前置动作。
- 问题：`getBomList()` 抛错时页面静默展示 demo BOM 列表，没有告知真实 BOM 列表接口不可用。
- 风险：计划员可能把 demo 的 BOM-A100/BOM-B200/BOM-C300 当成真实工程主数据清单，影响后续详情、齐套和排产判断。
- 修复：`loadBoms()` 失败时提示“BOM 列表加载失败”并展示底层错误，同时保留本地 demo BOM 列表维持页面可用。
- 行为保持：BOM 列表成功加载路径不变；成功时只清理同类旧“BOM 列表加载失败”告警，不清理 BOM 展开等其他错误。
- 测试：新增 TDD 用例 `alerts while showing local BOM records when the BOM list API is unavailable`，先红于 demo 列表存在但找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 409 tests passed`，总行覆盖率 `74.24%`，`BomBoard.vue` 行覆盖率 `69.18%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## BomBoard Detail Fallback Fail-loud Slice

- 选片依据：继续 `BomBoard.vue` 的用户必经详情入口；BOM 详情是替代料确认、ECN 影响分析、齐套检查和排产引用的共同前置数据。
- 问题：`getBomById()` 抛错时页面静默构造 demo BOM 详情，没有告知真实 BOM 详情接口不可用。
- 风险：计划员可能把 demo 物料项、版本和工程约束当成真实 BOM 详情，继续触发替代料、齐套和排产动作。
- 修复：`selectBom()` 失败时提示“BOM 详情加载失败”并展示底层错误，同时保留本地 detail fallback 维持页面可用。
- 行为保持：BOM 详情成功加载路径不变；成功时只清理同类旧“BOM 详情加载失败”告警，不清理列表或展开错误。
- 测试：新增 TDD 用例 `alerts while showing local BOM detail when the BOM detail API is unavailable`，先红于本地详情存在但找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1 file / 4 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 410 tests passed`，总行覆盖率 `74.31%`，`BomBoard.vue` 行覆盖率 `72.41%`。
- 验证：`npm run lint` 通过。
- 发布边界：`gh auth status` 已登录 `zenweb`，但 `origin` 仍指向腾讯工蜂，`gh repo view zenweb/AIMes` 仍不可解析；Hosted CI 等 B-track 发布闸门仍不关闭。

## BomBoard Alternate Approval Write Fail-loud Slice

- 选片依据：继续 `BomBoard.vue` 的用户必经工程数据动作；替代料放行会影响缺料冻结、OTD 证据链和 AI 排产约束。
- 问题：`writeAlternateMaterialApproval()` 抛错或无法持久化时，`approveAlternateMaterial()` 没有页面级失败反馈。
- 风险：计划员可能点击“确认替代料放行”后以为工程确认已写入，但审批证据和 OTD 证据链实际未持久化。
- 修复：`approveAlternateMaterial()` 捕获写入失败，提示“替代料放行失败”并展示底层错误；写入返回 `null` 时提示重试；成功时只清理同类旧告警。
- 行为保持：成功放行路径仍把返回的审批记录写入 `alternateApproval`，页面继续展示“已工程放行”和审计号。
- 测试：新增 TDD 用例 `alerts and keeps alternate material pending when approval persistence fails`，先红于未捕获 native event handler 错误且找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1 file / 5 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 411 tests passed`，总行覆盖率 `74.30%`，`BomBoard.vue` 行覆盖率 `72.37%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## BomBoard ECN Impact Write Fail-loud Slice

- 选片依据：继续 `BomBoard.vue` 的工程变更证据动作；ECN 影响分析会影响库存、质量、供应商、成本、OTD 和排产准入判断。
- 问题：`writeEngineeringChangeImpactAnalysis()` 抛错或无法持久化时，`analyzeEngineeringChangeImpact()` 没有页面级失败反馈。
- 风险：计划员可能点击“生成影响分析”后以为 ECN 证据已经生成，但工程变更分析和后续审批状态实际未持久化。
- 修复：`analyzeEngineeringChangeImpact()` 捕获写入失败，提示“ECN 影响分析失败”并展示底层错误；写入返回 `null` 时提示重试；成功时只清理同类旧告警。
- 行为保持：成功分析路径仍把返回的 ECN 记录写入 `engineeringChangeImpact`，页面继续展示影响分析、审计号和批准/驳回动作。
- 测试：新增 TDD 用例 `alerts and keeps engineering change pending when impact analysis persistence fails`，先红于未捕获 native event handler 错误且找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 412 tests passed`，总行覆盖率 `74.30%`，`BomBoard.vue` 行覆盖率 `72.34%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## BomBoard Kitting Package Write Fail-loud Slice

- 选片依据：继续 `BomBoard.vue` 的 BOM 展开齐套动作；齐套检查包会把 BOM 主数据缺口写入库存齐套和排产复核证据链。
- 问题：`writeBomKittingPackage()` 抛错时，`publishBomKittingPackage()` 没有页面级失败反馈，并可能让用户误以为齐套包已发布。
- 风险：计划员可能点击“生成 BOM 齐套检查包”后以为库存齐套和 OTD 证据链已经收到缺料记录，但真实持久化失败。
- 修复：`publishBomKittingPackage()` 捕获齐套包和 OTD 证据链写入失败，提示“BOM 齐套检查包发布失败”并展示底层错误；失败时保持未发布状态。
- 行为保持：成功发布路径仍先写齐套包，再写 OTD 证据链，最后把 `bomKittingPackage` 更新为发布记录；成功时只清理同类旧告警。
- 测试：新增 TDD 用例 `alerts and keeps BOM kitting package unpublished when package persistence fails`，先红于未捕获 native event handler 错误且找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 413 tests passed`，总行覆盖率 `74.38%`，`BomBoard.vue` 行覆盖率 `75.91%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## BomBoard ECN Decision Write Fail-loud Slice

- 选片依据：继续 `BomBoard.vue` 的 ECN 决策动作；批准/驳回会改变工程变更是否可正式进入 AI 排产。
- 问题：`approveEngineeringChangeImpactAnalysis()` 或 `rejectEngineeringChangeImpactAnalysis()` 抛错时，页面没有失败反馈。
- 风险：工程经理可能误以为 ECN 已批准或驳回，但决策审计号和排产准入状态实际未持久化。
- 修复：`approveEngineeringChange()` 和 `rejectEngineeringChange()` 捕获写入失败，分别提示“ECN 放行失败”和“ECN 驳回失败”并展示底层错误；失败时保持 pending 决策状态。
- 行为保持：成功批准/驳回路径仍把返回记录写入 `engineeringChangeImpact`；成功时只清理同类旧告警。
- 测试：新增 TDD 用例 `alerts and keeps engineering change pending when approval persistence fails` 与 `alerts and keeps engineering change pending when rejection persistence fails`，先红于未捕获 native event handler 错误且找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1 file / 9 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 415 tests passed`，总行覆盖率 `74.44%`，`BomBoard.vue` 行覆盖率 `78.53%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。
