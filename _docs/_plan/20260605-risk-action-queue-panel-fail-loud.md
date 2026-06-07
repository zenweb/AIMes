# 2026-06-05 RiskActionQueuePanel Fail-loud Plan

## Success Criteria

- 异常分流风险来源失败时，不得出现 mounted hook unhandled rejection。
- 异常分流风险来源失败时，不得让基础风险处置队列变成空白。
- 异常分流风险来源失败时，必须用 `[role="alert"]` 和 `aria-live="assertive"` 明确提示失败原因。
- 单个风险来源失败时，不得打断基础 3 张风险卡和其它来源继续渲染。
- SLA 复核读取失败时，不得在风险队列同步前中断 mounted 阶段。
- SLA 复核读取失败时，必须用 `[role="alert"]` 明确提示失败原因，并保留基础风险卡。
- 风险关闭留痕失败时，不得把卡片状态改成“已关闭”，不得插入关闭处置记录。
- 现场态势风险关闭留痕失败时，不得反写现场处置包闭环。
- 现场态势风险关闭成功时，风险关闭留痕只能写一次，且必须早于现场处置包反写。
- 风险转派留痕失败时，不得把卡片状态改成“已转派”，不得变更负责人或插入转派处置记录。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：按覆盖率杠杆从审计回放详情微切片转向 `RiskActionQueuePanel.vue`，该组件属于风险处置用户关键路径。
- 已完成：新增红灯测试覆盖 `readAnomalyDispatchRecordsBackendFirst()` 失败时不得中断基础风险队列。
- 已完成：修复风险来源同步，失败来源降级为空并显示来源级 assertive alert。
- 已完成：新增红灯测试覆盖 `readRiskSlaReviewRecordBackendFirst()` 失败时不得中断基础风险队列。
- 已完成：修复 SLA 复核读取失败边界，失败时降级为 `null` 并继续同步风险队列。
- 已完成：新增红灯测试覆盖普通风险关闭留痕失败时不得假关闭。
- 已完成：修复普通关闭路径，先留痕成功再改状态和插入关闭记录。
- 已完成：新增红灯测试覆盖现场态势风险关闭留痕失败时不得先反写现场处置包。
- 已完成：修复现场态势关闭顺序，风险留痕成功后才允许跨模块闭环。
- 已完成：新增红灯测试覆盖现场态势关闭成功时风险留痕不得重复写入，且必须先于现场处置包反写。
- 已完成：移除现场态势关闭成功路径里的重复风险留痕写入。
- 已完成：新增红灯测试覆盖风险转派留痕失败时不得假转派。
- 已完成：修复转派路径，先写目标负责人留痕，成功后才改状态、负责人和处置记录。
- 已验证：目标 unit `1 file / 8 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 465 tests passed`；总行覆盖率 `76.27%`，`RiskActionQueuePanel.vue` 行覆盖率 `84.74%`。
- 已验证：`npm run lint` 通过。
- 下一步：继续按覆盖率杠杆审计 `ChatPanel.vue` / `RoutingBoard.vue` 等用户必经低覆盖组件，或为风险队列其它来源失败路径补专门断言。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前根 `.github/workflows/ci.yml` / `eval.yml` 已存在；`gh` 已登录但 remote 仍是腾讯工蜂，Hosted CI 需要 GitHub repo 绑定后才能实跑取证。
