# 2026-06-05 RoutingBoard Fail-loud Changelog

## Route List Loading Failure Slice

- 选片依据：按覆盖率杠杆转向 `RoutingBoard.vue`，该组件是工艺路线和 AI 排产约束的关键入口，且当前覆盖率低于已深挖的风险队列组件。
- 问题：`getRouteList()` 失败时会静默降级到本地 demo routes，没有告知用户真实工艺路线列表加载失败。
- 风险：用户可能把本地演示路线误认为真实后端路线数据，进而错误判断工艺路线数量、发布状态和排产约束。
- 修复：路线列表加载失败时显示 `role="alert"` / `aria-live="assertive"` 的“工艺路线列表加载失败：...”提示，同时保留 demo routes 兜底。
- 行为保持：后端列表加载成功时清空错误提示；demo 兜底仍保持可见，避免空白页面。
- 测试：新增 TDD 用例 `alerts and keeps demo routes visible when route list loading fails`，先红于缺失 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1 file / 2 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 468 tests passed`，总行覆盖率 `76.31%`，`RoutingBoard.vue` 行覆盖率 `73.1%`。
- 验证：`npm run lint` 通过。

## Route Detail Loading Failure Slice

- 问题：`getRouteById()` 失败时会静默降级到本地 demo detail，没有告知用户真实工序详情加载失败。
- 风险：用户可能把本地演示工序误认为真实后端详情，影响工艺路线工序、设备能力和排产约束判断。
- 修复：路线详情加载失败时显示 `role="alert"` / `aria-live="assertive"` 的“工艺路线详情加载失败：...”提示，同时保留 demo detail 兜底。
- 行为保持：详情加载成功时清空错误提示；demo detail 兜底仍保持可见，避免详情面板空白。
- 测试：新增 TDD 用例 `alerts and keeps a demo detail visible when route detail loading fails`，先红于缺失 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1 file / 3 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 469 tests passed`，总行覆盖率 `76.34%`，`RoutingBoard.vue` 行覆盖率 `76.03%`。
- 验证：`npm run lint` 通过。

## Capability Validation History Loading Failure Slice

- 问题：`readRouteCapabilityValidationBackendFirst()` 失败时会从 `onMounted()` 或路线选择流程向外抛错，阻断路线列表加载且没有用户可见提示。
- 风险：工艺路线页面可能停留在空列表，用户也无法判断能力校验历史是否可信，影响热处理瓶颈校验闭环。
- 修复：能力校验历史读取失败时显示 `role="alert"` / `aria-live="assertive"` 的“能力校验记录加载失败：...”提示，并把能力校验状态回退为“待校验”。
- 行为保持：路线列表加载不再被能力校验历史失败阻断；路线数据错误和能力校验历史错误分开清理，避免成功请求误清除其它失败告警。
- 测试：新增 TDD 用例 `alerts without blocking the route list when capability validation history loading fails`，先红于 mounted hook 未处理异常和路线列表 0 条，再最小修复。
- 验证：`npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1 file / 4 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 470 tests passed`，总行覆盖率 `76.36%`，`RoutingBoard.vue` 行覆盖率 `77.16%`。
- 验证：`npm run lint` 通过。

## Capability Validation Evidence Save Failure Slice

- 问题：`writeRouteCapabilityValidation()` 返回 `null` 时，“运行能力校验”和“确认分流/合批方案”会静默返回，没有告知能力校验证据未保存。
- 风险：用户可能以为已经完成瓶颈校验或释放方案，但本地/后端证据链没有留痕，后续 AI 排产、审计链和 OTD 复盘会引用缺证状态。
- 修复：能力校验写入失败时显示“能力校验证据保存失败：...”并保持“待校验”；分流/合批写入失败时显示“分流/合批证据保存失败：...”并保持当前校验状态。
- 行为保持：写入成功时清空能力校验错误，并按原逻辑更新 `routeCapabilityRecord` 与 `routeCapabilityDecision`。
- 测试：新增 TDD 用例覆盖能力校验保存失败，先红于缺失 `[role="alert"]`，再最小修复。
- 测试：新增 TDD 用例覆盖分流/合批保存失败，先红于缺失 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1 file / 6 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 472 tests passed`，总行覆盖率 `76.4%`，`RoutingBoard.vue` 行覆盖率 `79.69%`。
- 验证：`npm run lint` 通过。

## Capability Validation Slow-read Non-blocking Slice

- 问题：`onMounted()` 先 `await applyStoredRouteCapabilityValidation()`，再调用 `loadRoutes()`；能力校验历史读取慢时会阻断用户必看的工艺路线列表。
- 风险：辅助证据读取延迟会让主路线列表停留空态，用户无法进入工艺路线和排产约束主流程。
- 修复：挂载时改为后台触发能力校验历史读取，同时立即调用 `loadRoutes()`；读取失败仍由 `applyStoredRouteCapabilityValidation()` 自身 fail-loud 处理。
- 测试：新增 TDD 用例 `loads the route list while capability validation history is still pending`，先红于 `getRouteList()` 调用次数为 0，再最小修复。
- 测试卫生：慢读取测试使用可释放 deferred promise，避免把未完成 promise 泄漏给全量测试环境。
- 验证：`npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1 file / 7 tests passed`。
- 验证：`npm run test:unit:coverage` 单独运行通过，`82 files / 473 tests passed`，总行覆盖率 `76.4%`，`RoutingBoard.vue` 行覆盖率 `79.69%`。
- 验证：`npm run lint` 通过。
- 验证注意：本轮曾并行运行 coverage 与 lint，coverage 出现多个既有测试 5s timeout；随后单独运行 coverage 通过，因此可信发布前证据采用 standalone coverage 输出，不把并行资源竞争结果当作代码失败结论。

## Capability Release Precondition Slice

- 问题：`确认分流/合批方案` 按钮只在 `released` 后禁用，`open` / “待校验”状态也能直接点击，可能绕过“先运行能力校验并保存证据”的闭环。
- 风险：用户可以在未保存瓶颈能力校验证据时直接确认分流/合批，导致释放方案缺少前置校验依据。
- 修复：释放按钮禁用条件改为 `routeCapabilityDecision !== 'validated'`；只有已保存“瓶颈已校验”后才能确认分流/合批。
- 测试：新增 TDD 用例 `requires a saved capability validation before releasing the split or batch plan`，先红于按钮没有 `disabled`，再最小修复。
- 测试调整：释放保存失败用例改为先成功保存能力校验，再模拟释放写入失败，符合真实状态机。
- 验证：`npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run lint` 通过。
- 验证注意：本轮 `npm run test:unit:coverage` 未取得通过证据，失败集中在 `auth.store.test.ts` 和 `gantt-chart.test.ts` 的全量覆盖率运行 timeout / mock 异常；两个文件单独复跑均通过（`auth.store.test.ts` 7/7，`gantt-chart.test.ts` 5/5）。该 coverage flake 需要后续单独收口，不能把本片标为 full coverage passed。

## Unit Coverage Timeout Stabilization Slice

- 问题：全量 `npm run test:unit:coverage` 在 Windows + V8 coverage + 多 worker 压力下触发 Vitest 默认 5s 单测超时，导致 `auth.store.test.ts`、`gantt-chart.test.ts` 等单独可通过的测试在 full coverage 中假红。
- 风险：Sprint 0 基线会被资源竞争噪音污染，后续 review 难以判断是真回归还是验证超时。
- 修复：在 `vitest.config.ts` 设置 `testTimeout: 15000`，给 coverage 模式下的 jsdom/组件测试留出稳定执行窗口。
- 行为保持：未修改业务代码和断言逻辑；单独测试仍按原命令执行。
- 验证：`npm run test:unit:coverage` 通过，`82 files / 474 tests passed`，总行覆盖率 `76.39%`，`RoutingBoard.vue` 行覆盖率 `81.95%`。
- 验证：`npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1 file / 8 tests passed`。
- 验证：`npm run lint` 通过。

## Release Boundary

- 本片属于 A-track 前端工艺路线可靠性证据。
- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据，不能被本片单测或覆盖率结果替代。
