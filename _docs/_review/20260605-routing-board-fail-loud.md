# 2026-06-05 RoutingBoard Fail-loud Review

## Findings

- 审计结论：本片修复工艺路线列表加载失败时静默显示 demo routes 的问题。
- 行为覆盖：`getRouteList()` 抛错时，页面必须显示本地 demo routes，避免空白页面。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“工艺路线列表加载失败”和后端失败原因。
- 边界覆盖：后端加载成功时错误提示必须清空，不能污染真实数据状态。
- TDD 证据：新增用例先失败于缺失 `[role="alert"]`；修复后目标 unit 变绿。
- 审计结论：本片继续修复工艺路线详情加载失败时静默显示 demo detail 的问题。
- 行为覆盖：`getRouteById()` 抛错时，页面必须显示本地 demo detail，避免详情面板空白。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“工艺路线详情加载失败”和后端失败原因。
- 边界覆盖：详情加载成功时错误提示必须清空，不能污染真实详情状态。
- TDD 证据：新增详情失败用例先失败于缺失 `[role="alert"]`；修复后目标 unit 变绿。
- 审计结论：本片继续修复能力校验历史读取失败会阻断工艺路线列表加载的问题。
- 行为覆盖：`readRouteCapabilityValidationBackendFirst()` 抛错时，页面必须继续加载路线列表，避免空列表。
- Fail-loud 覆盖：同一场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，并包含“能力校验记录加载失败”和失败原因。
- 状态覆盖：能力校验历史失败时必须回退为“待校验”，不能沿用不可信历史结论。
- TDD 证据：新增能力校验读取失败用例先失败于 mounted hook 未处理异常和路线列表 0 条；修复后目标 unit 变绿。
- 审计结论：本片继续修复能力校验证据写入失败时静默返回的问题。
- 行为覆盖：`writeRouteCapabilityValidation()` 返回 `null` 时，运行能力校验不得变成“瓶颈已校验”，确认分流/合批不得变成“分流已确认”。
- Fail-loud 覆盖：两个写入失败场景必须显示 `[role="alert"]` 和 `aria-live="assertive"`，分别包含“能力校验证据保存失败”和“分流/合批证据保存失败”。
- 状态覆盖：保存失败时保持待校验或当前校验状态，避免把未留痕操作当成已完成。
- TDD 证据：两个新增写入失败用例均先红于缺失 `[role="alert"]`；修复后目标 unit 变绿。
- 审计结论：本片继续修复能力校验历史慢读取会阻断主路线列表的问题。
- 行为覆盖：能力校验历史 promise 仍 pending 时，`getRouteList(1, 10)` 必须已经调用，页面必须显示 2 条后端路线。
- 依赖边界覆盖：能力校验历史是辅助证据，不得成为工艺路线列表的前置依赖；读取失败仍保留独立 fail-loud 告警。
- TDD 证据：新增慢读取用例先红于 `getRouteList()` 调用次数为 0；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 7 tests passed`；全量前端 unit coverage 单独运行 `82 files / 473 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.4%`，`RoutingBoard.vue` 行覆盖率 `79.69%`。
- 验证注意：coverage 与 lint 并行运行曾触发多个既有测试 timeout；单独 coverage 通过，本次审计采用单独 coverage 作为可靠证据。
- 审计结论：本片继续修复分流/合批释放可绕过能力校验的问题。
- 行为覆盖：`routeCapabilityDecision` 为 `open` 时，`确认分流/合批方案` 按钮必须禁用，不能写入 `released` 证据。
- 状态机覆盖：只有 `validated` 状态允许释放；`released` 状态继续禁用，避免重复确认。
- TDD 证据：新增释放前置条件用例先红于按钮未禁用；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 8 tests passed`；`npm run lint` 通过。
- Coverage 证据不足：本轮全量 coverage 未通过，失败集中在 `auth.store.test.ts` 与 `gantt-chart.test.ts` 的全量运行 timeout / mock 异常；两个失败文件单独复跑均通过。不能声明本片 full coverage passed。
- 审计结论：本片继续收口 full coverage 假红，提升 Sprint 0 基线稳定性。
- 根因证据：失败测试文件单独复跑均通过，说明不是业务断言持续失败；full coverage 下多个文件触发默认 5s timeout，符合 coverage 资源压力下超时过窄。
- 修复覆盖：`vitest.config.ts` 增加 `testTimeout: 15000`，只调整测试基础设施，不改变业务代码。
- 验证证据：全量前端 unit coverage `82 files / 474 tests passed`；目标 unit `1 file / 8 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `76.39%`，`RoutingBoard.vue` 行覆盖率 `81.95%`。

## Residual Risk

- `RoutingBoard.vue` 能力校验读取和写入 fail-loud 主路径已覆盖；剩余未覆盖行主要集中在分页、成功留痕显示和 mounted 重读等非本片路径。
- full coverage flake 已通过 test timeout 收口；后续若 CI 仍慢，应优先看 hosted runner 资源，而不是继续扩大断言等待。
- 发布边界未关闭：本片不提供 Hosted CI、staging、攻击链验证、安全签字、灰度或 14 天观察证据；当前仓库尚未绑定 GitHub remote，不能取得真实 GitHub Actions run。
