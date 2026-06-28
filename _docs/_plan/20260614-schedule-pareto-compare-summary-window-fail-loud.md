# 2026-06-14 Plan - 多目标对比计划摘要时间窗 Fail-Loud

## 目标
- 将排产多目标对比的采用前契约继续打磨到精品级别。
- 防止后端返回摘要时间窗与明细时间窗不一致的方案时，前端仍展示推荐和采用入口。
- 用单测、真实 Chromium 和覆盖率总检闭环验证。

## 成功标准
- 计划摘要时间窗未覆盖计划项时间窗时，页面展示 `批量优化对比失败: 后端对比方案计划摘要时间窗未覆盖计划明细`。
- 失败状态下不展示 `.recommend-card` 和 `.recommend-apply-btn`。
- 不触发 `apply` emit。
- `pareto-compare.test.ts`、`scheduling.spec.ts --project=chromium` 和 `test:unit:coverage` 全部通过。

## 执行记录
- 先补单测，确认旧逻辑仍会展示可采用推荐，形成 RED。
- 在 `ParetoCompare.vue` 的采用前响应校验中加入计划摘要时间窗覆盖检查。
- 补 Chromium 真实浏览器用例，验证告警和采用入口隐藏。
- 跑完整 ParetoCompare 单测、完整排产 Chromium 套件和前端覆盖率总检。

## 当前结论
- 本切片已完成并验证。
- 灰度 15 天观察按 owner 指令跳过/延期，不计入当前成功标准。
