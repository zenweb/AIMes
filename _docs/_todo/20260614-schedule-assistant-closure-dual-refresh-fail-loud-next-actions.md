# 2026-06-14 TODO - 排产 Assistant 闭环双刷新 Fail-Loud 后续

## 下一步
- 继续按覆盖率增量和用户关键路径选择排产深挖切片。
- 可优先检查 `ScheduleBoard.vue` 中 adoption、risk reload、formal writeback 的用户可见失败是否仍存在覆盖缺口。
- 若后续继续强化反馈承载，可评估把 `feedbackSyncNote` 从单字符串升级为结构化消息列表，但本轮不扩大范围。

## 验证基线
- 当前 `scheduling.spec.ts` Chromium：43 passed。
- 当前前端 unit coverage：105 files / 699 tests passed。
- `ScheduleBoard.vue` 当前行覆盖率 77.26%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
