# 2026-06-14 TODO - 多目标对比后端失败 Fail-Loud 后续

## 下一步
- 继续按覆盖率增量和用户关键路径选择排产深挖切片。
- 可继续检查 `ParetoCompare.vue` 的响应契约：空 `items`、`bestOverallObjective` 不在 `items` 中、单个对比项缺少 `plan`。
- 对 `批量方案反馈同步失败...` 用例的偶发首跑 flaky 保持观察；当前 focused 复跑通过，未作为本片阻塞。

## 验证基线
- 当前 `pareto-compare.test.ts`：3 passed。
- 当前 `scheduling.spec.ts` Chromium：49 passed，含 1 个 retry 通过的 flaky。
- 当前前端 unit coverage：105 files / 705 tests passed，lines 83.26%。
- `ParetoCompare.vue` 当前行覆盖率 90.41%。

## 非当前阻塞
- 15 天灰度观察已跳过/延期。
- 安全项不优先于当前现有排产功能深度打磨，除非直接阻断排产证据。
