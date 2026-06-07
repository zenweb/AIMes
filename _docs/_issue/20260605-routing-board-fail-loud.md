# 2026-06-05 RoutingBoard Fail-loud Issues

## Fixed

- 问题：`RoutingBoard.vue` 加载工艺路线列表失败时静默显示本地 demo routes。
- 风险：用户可能误判演示路线就是后端真实路线列表，影响工艺路线发布状态、能力约束和 AI 排产输入判断。
- 处理：新增 `routingError` 用户可见提示；`getRouteList()` 失败时显示 assertive alert，并说明已显示本地演示路线。
- 问题：`RoutingBoard.vue` 选择工艺路线后详情加载失败时静默显示本地 demo detail。
- 风险：用户可能误判演示工序就是后端真实工序详情，影响设备能力、质量门和排产约束判断。
- 处理：`getRouteById()` 失败时显示 assertive alert，并说明已显示本地演示详情。
- 问题：`RoutingBoard.vue` 读取能力校验历史失败时未处理异常，可能阻断工艺路线列表加载。
- 风险：用户进入工艺路线页后看到空列表，且无法知道能力校验历史不可用，影响 R-B200 热处理瓶颈校验闭环判断。
- 处理：新增能力校验历史失败提示；失败时状态回退为“待校验”，路线列表继续加载。
- 问题：`RoutingBoard.vue` 能力校验和分流/合批写入失败时静默返回。
- 风险：用户可能以为瓶颈校验或释放方案已经完成，但证据链没有写入，导致 AI 排产和审计复盘引用缺证结论。
- 处理：新增能力校验证据保存失败和分流/合批证据保存失败提示；保存失败时不推进校验状态。
- 问题：`RoutingBoard.vue` 挂载时等待能力校验历史读取完成后才加载路线列表。
- 风险：辅助证据读取变慢时，用户必经的工艺路线列表被阻断为空态。
- 处理：挂载时并行触发能力校验历史读取和路线列表加载；能力校验失败仍独立 fail loud。
- 问题：`RoutingBoard.vue` 在“待校验”状态允许直接点击“确认分流/合批方案”。
- 风险：释放方案可绕过已保存的瓶颈能力校验证据，破坏能力校验闭环。
- 处理：释放按钮只在 `validated` 状态启用；`open` 和 `released` 状态禁用。
- 验证：目标 unit `1 file / 8 tests passed`，lint 通过。
- 验证注意：coverage 与 lint 并行运行曾触发既有测试 timeout；单独 coverage 通过，后续本地收口优先串行运行重型验证。
- 新增验证注意：本轮 full coverage 未取得通过证据；`auth.store.test.ts` 与 `gantt-chart.test.ts` 在 full coverage 中失败，但单独复跑均通过，需要后续收口 flake。
- 问题：full coverage 在默认 5s 单测超时下对 jsdom/coverage 压力敏感，产生假红。
- 风险：Sprint 0 基线不稳定，会干扰后续变更审计。
- 处理：`vitest.config.ts` 增加 `testTimeout: 15000`。
- 验证：full coverage 已通过，`82 files / 474 tests passed`；目标 RoutingBoard unit `1 file / 8 tests passed`；lint 通过。

## Remaining

- `RoutingBoard.vue` 行覆盖率当前为 `79.69%`；后续可审计分页、成功留痕显示和 mounted 重读等剩余路径，或按覆盖率杠杆转向更低覆盖的用户关键组件。
- `RoutingBoard.vue` 行覆盖率最新为 `81.95%`；继续按覆盖率杠杆时，可转向更低覆盖且用户关键的组件。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，Docker 可用；当前仓库 remote 仍不指向 GitHub，不能取得真实 hosted CI run。
