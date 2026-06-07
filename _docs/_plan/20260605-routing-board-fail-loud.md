# 2026-06-05 RoutingBoard Fail-loud Plan

## Success Criteria

- 工艺路线列表 API 失败时，不得静默显示 demo routes。
- 工艺路线列表 API 失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 工艺路线列表 API 失败时，仍保留 demo routes 兜底，避免空白页面。
- 工艺路线列表 API 成功时，必须清空失败提示。
- 工艺路线详情 API 失败时，不得静默显示 demo detail。
- 工艺路线详情 API 失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 工艺路线详情 API 失败时，仍保留 demo detail 兜底，避免详情面板空白。
- 工艺路线详情 API 成功时，必须清空失败提示。
- 能力校验历史读取失败时，不得阻断路线列表加载。
- 能力校验历史读取失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 能力校验历史读取失败时，必须回退为“待校验”，避免使用不可信历史结论。
- 能力校验写入失败时，不得静默返回或推进为“瓶颈已校验”。
- 分流/合批写入失败时，不得静默返回或推进为“分流已确认”。
- 能力校验历史读取变慢时，不得阻断工艺路线列表加载。
- 分流/合批释放必须依赖已保存的能力校验证据；待校验状态不得直接释放。
- Full coverage 基线不得被默认 5s timeout 假红污染。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：新增红灯测试覆盖 `getRouteList()` 失败时不得静默降级。
- 已完成：修复 `RoutingBoard.vue`，失败时显示“工艺路线列表加载失败：...”，并保留 demo routes。
- 已完成：新增红灯测试覆盖 `getRouteById()` 失败时不得静默降级。
- 已完成：修复 `RoutingBoard.vue`，详情失败时显示“工艺路线详情加载失败：...”，并保留 demo detail。
- 已完成：新增红灯测试覆盖 `readRouteCapabilityValidationBackendFirst()` 失败时不得阻断路线列表。
- 已完成：修复 `RoutingBoard.vue`，能力校验历史失败时显示“能力校验记录加载失败：...”，并回退到“待校验”。
- 已完成：新增红灯测试覆盖能力校验写入失败时不得静默返回。
- 已完成：修复 `RoutingBoard.vue`，能力校验保存失败时显示“能力校验证据保存失败：...”，并保持“待校验”。
- 已完成：新增红灯测试覆盖分流/合批写入失败时不得静默返回。
- 已完成：修复 `RoutingBoard.vue`，分流/合批保存失败时显示“分流/合批证据保存失败：...”，并保持当前校验状态。
- 已完成：新增红灯测试覆盖能力校验历史 pending 时路线列表仍需加载。
- 已完成：修复 `RoutingBoard.vue`，挂载时后台读取能力校验历史并立即加载路线列表。
- 已完成：新增红灯测试覆盖“待校验”状态不能直接确认分流/合批。
- 已完成：修复 `RoutingBoard.vue`，释放按钮仅在 `validated` 状态启用。
- 已验证：目标 unit `1 file / 8 tests passed`。
- 已验证：`npm run lint` 通过。
- 已记录：coverage 与 lint 并行运行曾触发既有测试 timeout；本片可靠证据采用串行/单独 coverage。
- 未通过：本轮 `npm run test:unit:coverage` 未取得通过证据；`auth.store.test.ts` 与 `gantt-chart.test.ts` 在 full coverage 中失败，但单独复跑均通过。
- 已完成：`vitest.config.ts` 增加 `testTimeout: 15000`，收口 coverage 模式下默认 5s 超时假红。
- 已验证：全量前端 unit coverage `82 files / 474 tests passed`；总行覆盖率 `76.39%`，`RoutingBoard.vue` 行覆盖率 `81.95%`。
- 已验证：目标 unit `1 file / 8 tests passed`；`npm run lint` 通过。
- 下一步：继续按覆盖率杠杆审计分页、成功留痕显示和 mounted 重读等剩余路径，或转向更低覆盖的用户关键组件。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前 `gh` 已登录但 remote 仍是腾讯工蜂，Hosted CI 需要 GitHub repo 绑定后才能实跑取证。
