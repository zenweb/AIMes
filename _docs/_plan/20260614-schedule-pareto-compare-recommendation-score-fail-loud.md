# 2026-06-14 Plan - 多目标对比推荐最高分 Fail-Loud

## 成功标准
- 当后端推荐目标不是综合得分最高方案时，`ParetoCompare` 必须展示业务化 fail-loud 告警。
- 告警状态下不得渲染推荐卡、图表或“采用此方案”入口。
- 单测与真实 Chromium e2e 都覆盖该契约。
- 覆盖率、diff 检查、敏感信息扫描和关键文本审计完成。

## 执行步骤
- 已用 TDD 添加单测与真实 Chromium 用例，并确认旧逻辑 RED。
- 已在 `ParetoCompare.vue` 增加 `recommendationScore` 与 `hasMismatchedBestOverallObjective`。
- 已将推荐最高分校验放在 KPI、换型分钟、分组数基础数据校验之后。
- 已完成窄范围 GREEN、完整组件单测、完整 scheduling Chromium、覆盖率验证。

## 停止条件
- 本片在审计通过后停止，不继续扩大到新模块。
- feedback warning flaky 作为下一片单独处理。

## 追加计划 - 推荐卡可审计分数组成
- 成功标准：真实浏览器打开多目标对比后，推荐卡必须展示综合分和五个分项指标。
- 执行：复用已有批量方案反馈 e2e fixture，追加推荐卡文本断言，避免重复 mock。
- 验证：`npm run test:e2e -- --grep "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`，1 passed。
