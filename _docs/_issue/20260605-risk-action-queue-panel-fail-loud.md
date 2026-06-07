# 2026-06-05 RiskActionQueuePanel Fail-loud Issues

## Fixed

- 问题：`RiskActionQueuePanel.vue` mounted 阶段 `readAnomalyDispatchRecordsBackendFirst()` 失败时会产生未处理异常，基础风险卡也不显示。
- 风险：用户可能把“异常分流来源失败”误判为“没有待处置风险”，调度员 Agent 触发器和 SLA 复核入口失去基础兜底。
- 处理：风险来源读取改为来源级捕获，失败时显示 assertive alert，并继续渲染基础 3 张风险处置卡。
- 问题：`readRiskSlaReviewRecordBackendFirst()` 失败时会在 `syncRiskActionQueue()` 前中断 mounted 阶段，导致基础风险卡不显示。
- 风险：SLA 复核 API 不可用会掩盖基础风险队列，用户无法继续处理工单延期、物料缺口和设备健康风险。
- 处理：SLA 复核读取失败降级为 `null`，显示“风险 SLA 复核加载失败”，并继续同步风险队列。
- 问题：普通风险关闭时先更新 UI 为“已关闭”，再写风险处置留痕；留痕失败会留下假关闭状态。
- 风险：审计链失败时用户仍会看到风险已关闭，处置记录和真实风险留痕不一致。
- 处理：关闭动作改为先写风险处置留痕，失败时保持原状态并显示“风险关闭失败”。
- 问题：现场态势风险关闭时先反写现场处置包，再写风险处置留痕；留痕失败会造成跨模块假闭环。
- 风险：下游现场处置包可能已闭环，但风险队列没有对应关闭留痕。
- 处理：现场态势关闭也先通过风险处置留痕，成功后才调用 `closeMonitoringSituationEscalation()`。
- 问题：现场态势关闭成功路径在顺序重排后可能重复写入同一个关闭留痕。
- 风险：审计链出现重复关闭记录，影响后续回放和责任动作核对。
- 处理：保留一次风险关闭留痕，并断言其调用顺序早于现场处置包反写。
- 问题：风险转派时先更新 UI 和负责人，再写风险处置留痕；留痕失败会留下假转派状态。
- 风险：责任人显示已变更，但审计链没有转派证据，影响调度员交接和后续责任动作核对。
- 处理：转派动作改为先写目标负责人留痕，失败时保持原状态并显示“风险转派失败”。
- 验证：目标 unit `1 file / 8 tests passed`，全量前端 unit coverage `82 files / 465 tests passed`，lint 通过。

## Remaining

- `RiskActionQueuePanel.vue` 行覆盖率当前为 `84.74%`；后续可继续审计生产异常、助手执行包、现场态势来源失败路径。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，Docker 可用；根 `.github/workflows/ci.yml` / `eval.yml` 存在；当前仓库 remote 仍不指向 GitHub，不能取得真实 hosted CI run。
