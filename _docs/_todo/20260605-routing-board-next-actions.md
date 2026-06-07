# 2026-06-05 RoutingBoard Next Actions

## Done

- 已完成：`RoutingBoard.vue` 工艺路线列表加载失败时 fail loud，避免本地 demo routes 被静默当成真实后端路线。
- 已完成：新增目标测试覆盖 `getRouteList()` 失败时显示 assertive alert，并保留 3 条本地演示路线。
- 已完成：`RoutingBoard.vue` 工艺路线详情加载失败时 fail loud，避免本地 demo detail 被静默当成真实后端工序详情。
- 已完成：新增目标测试覆盖 `getRouteById()` 失败时显示 assertive alert，并保留本地演示详情。
- 已完成：`RoutingBoard.vue` 能力校验历史读取失败时 fail loud，避免页面空列表或沿用不可信历史结论。
- 已完成：新增目标测试覆盖 `readRouteCapabilityValidationBackendFirst()` 失败时显示 assertive alert，并继续加载 2 条后端路线。
- 已完成：`RoutingBoard.vue` 能力校验写入失败时 fail loud，避免未留痕校验被当成“瓶颈已校验”。
- 已完成：`RoutingBoard.vue` 分流/合批写入失败时 fail loud，避免未留痕释放方案被当成“分流已确认”。
- 已完成：新增目标测试覆盖两个写入失败场景均显示 assertive alert，并保持安全状态。
- 已完成：`RoutingBoard.vue` 能力校验历史慢读取不再阻断路线列表加载。
- 已完成：新增目标测试覆盖能力校验历史仍 pending 时，路线列表 API 已调用并显示 2 条后端路线。
- 已完成：`RoutingBoard.vue` 待校验状态禁止直接确认分流/合批，释放必须依赖已保存的能力校验证据。
- 已完成：新增目标测试覆盖释放前置条件；目标 unit `1 file / 8 tests passed`。
- 已完成：lint 验证通过。
- 已记录：coverage 与 lint 并行运行曾触发既有测试 timeout；单独 coverage 通过，后续本地重型验证优先串行运行。
- 已记录：本轮 full coverage 未取得通过证据；`auth.store.test.ts` 与 `gantt-chart.test.ts` full coverage 失败但单独复跑通过。
- 已完成：`vitest.config.ts` 增加 `testTimeout: 15000`，收口 full coverage 默认 5s timeout 假红。
- 已完成：full coverage 重新通过，`82 files / 474 tests passed`；`RoutingBoard.vue` 行覆盖率为 `81.95%`。

## Continue

- 继续：按覆盖率杠杆转向更低覆盖且用户关键的组件，或审计 `RoutingBoard.vue` 分页、成功留痕显示和 mounted 重读等剩余路径。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录和 Docker 可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
