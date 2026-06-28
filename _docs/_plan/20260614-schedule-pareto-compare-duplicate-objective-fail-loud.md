# 2026-06-14 Plan - 多目标对比目标标识重复 Fail-Loud

## 目标
- 将排产多目标对比的采用前契约继续打磨到精品级别。
- 防止后端返回重复 `objective` key 时，前端仍展示推荐、目标 tab 和采用入口。
- 用单测、真实 Chromium 和覆盖率总检闭环验证。

## 成功标准
- 重复 `objective` key 时，页面展示 `批量优化对比失败: 后端对比方案目标标识重复`。
- 失败状态下不展示 `.recommend-card` 和 `.recommend-apply-btn`。
- 不触发 `apply` emit。
- `pareto-compare.test.ts`、`scheduling.spec.ts --project=chromium` 和 `test:unit:coverage` 完成验证。
- 敏感信息扫描 touched files 不命中。

## 执行记录
- 先补单测，确认旧逻辑仍会展示可采用推荐，形成 RED。
- 补 Chromium 真实浏览器用例，确认旧逻辑不展示 fail-loud 告警，形成 RED。
- 在 `ParetoCompare.vue` 的采用前响应校验中加入目标标识唯一性检查。
- 跑窄单测、窄 Chromium、完整 ParetoCompare 单测、完整排产 Chromium 套件、前端覆盖率总检。

## 当前结论
- 本切片代码和测试验证已完成。
- 完整排产 Chromium 套件中 1 个既有 flaky 已被单独复测通过，需要后续继续观察或单独硬化。
- 灰度 15 天观察按 owner 指令跳过/延期，不计入当前成功标准。
