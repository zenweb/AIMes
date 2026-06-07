# 2026-06-05 RiskActionQueuePanel Next Actions

## Done

- 已完成：`RiskActionQueuePanel.vue` 异常分流风险来源失败时 fail loud，避免基础风险队列被 mounted 异常冲掉。
- 已完成：新增目标测试覆盖异常分流 API 失败时仍显示 3 张基础风险卡，并提示“异常分流风险加载失败”。
- 已完成：`RiskActionQueuePanel.vue` SLA 复核记录加载失败时 fail loud，避免风险队列同步前被 mounted 异常冲掉。
- 已完成：新增目标测试覆盖 SLA 复核 API 失败时仍显示 3 张基础风险卡，并提示“风险 SLA 复核加载失败”。
- 已完成：`RiskActionQueuePanel.vue` 普通风险关闭留痕失败时 fail loud，避免 UI 假关闭。
- 已完成：新增目标测试覆盖关闭留痕失败时风险保持原状态，并提示“风险关闭失败”。
- 已完成：`RiskActionQueuePanel.vue` 现场态势风险关闭留痕失败时不再先反写现场处置包闭环。
- 已完成：新增目标测试覆盖现场态势关闭留痕失败时 `closeMonitoringSituationEscalation()` 不被调用。
- 已完成：新增目标测试覆盖现场态势关闭成功时只写一次风险留痕，并且先于现场处置包反写。
- 已完成：`RiskActionQueuePanel.vue` 风险转派留痕失败时 fail loud，避免 UI 假转派。
- 已完成：新增目标测试覆盖转派留痕失败时风险保持待处置、负责人保持原值，并提示“风险转派失败”。
- 已完成：目标 unit、全量前端 coverage 和 lint 验证；`RiskActionQueuePanel.vue` 行覆盖率升至 `84.74%`。

## Continue

- 继续：按“覆盖率最低且用户必经/高风险”原则选择后续切片；`RiskActionQueuePanel.vue` 当前行覆盖率为 `84.74%`。
- 继续：可为生产异常、助手执行包、现场态势来源失败路径补专门断言；也可按覆盖率杠杆转向 `ChatPanel.vue` / `RoutingBoard.vue` 等用户必经低覆盖组件。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录和 Docker 可用，根 `.github/workflows/ci.yml` / `eval.yml` 存在；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
