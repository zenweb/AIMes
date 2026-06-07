# 2026-06-05 ScheduleBoard Bottleneck Fail-loud Issues

## Fixed

- 问题：`ScheduleBoard.vue` 中 `getBottleneckEquipmentIds()` 失败时被 `.catch(() => undefined)` 静默吞掉。
- 风险：排产计划仍显示，但甘特图缺失后端瓶颈设备标记，调度员无法知道瓶颈识别证据不可用。
- 处理：将单独失败转为 polite warning，保留主计划和甘特图渲染，不升级为阻断错误。
- 验证：目标 unit `1 file / 13 tests passed`，全量前端 unit coverage `82 files / 482 tests passed`，lint 通过。

## Remaining

- 继续按覆盖率杠杆选择低覆盖且用户关键路径，不继续在已收口组件上做低收益微切片。
- B-track 发布门仍缺真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
- B-track 环境复核：`gh` 已登录 `zenweb`，但当前 repo 仍缺 GitHub host remote；不重复空跑 `gh run list`。
