# 2026-06-14 Plan - 多目标对比依赖时间顺序 Fail-Loud

## 目标
- 将排产多目标对比的采用前契约继续打磨到精品级别。
- 防止后端返回依赖时间顺序不可执行的计划时，前端仍展示推荐和采用入口。
- 用单测、真实 Chromium 和覆盖率总检闭环验证。

## 成功标准
- 依赖任务完成前下游任务已开始时，页面展示 `批量优化对比失败: 后端对比方案计划项依赖时间顺序无效`。
- 失败状态下不展示 `.recommend-card` 和 `.recommend-apply-btn`。
- 不触发 `apply` emit。
- 自依赖和循环依赖仍保留各自更具体的 fail-loud 信息。
- `pareto-compare.test.ts`、`scheduling.spec.ts --project=chromium` 和 `test:unit:coverage` 全部通过。
- 敏感信息扫描 touched files 不命中。

## 执行记录
- 先补单测，确认旧逻辑仍会展示可采用推荐，形成 RED。
- 在 `ParetoCompare.vue` 的采用前响应校验中加入依赖时间顺序检查。
- 补 Chromium 真实浏览器用例，验证告警和采用入口隐藏。
- 首次完整相关套件发现新校验覆盖自依赖/循环依赖错误；调整校验顺序后重跑通过。
- 跑完整 ParetoCompare 单测、完整排产 Chromium 套件、前端覆盖率总检和敏感信息扫描。

## 当前结论
- 本切片已完成并验证。
- 灰度 15 天观察按 owner 指令跳过/延期，不计入当前成功标准。
