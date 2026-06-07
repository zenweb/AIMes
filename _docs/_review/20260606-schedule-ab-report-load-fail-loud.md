# Review: ScheduleBoard A/B 报告读取失败可见化

日期：2026-06-06

## 结论

- 未发现本片新增阻断问题。
- ScheduleBoard A/B 报告资源读取失败已从静默推导值变成页面可见 fail-loud 状态。
- 真实浏览器验证已覆盖 `latest-ab-report.json` 404 失败态。

## 证据

- 单元测试新增失败路径：fetch 抛错时，页面展示 `A/B 报告读取失败`、`基线 vs Agent OTD 对比暂用排产计划推导值` 和错误原因。
- Chromium e2e 新增失败态：拦截 `latest-ab-report.json` 为 404，断言失败提示和 OTD 对比来源说明同时可见。
- 覆盖率验证：`ScheduleBoard.vue` branches 39.45%，lines 73.51%。
- 生产构建：Nuxt production build passed。

## 剩余风险

- 本片只覆盖 A/B 报告资源读取失败路径。
- ScheduleBoard 分支覆盖仍低，下一片应继续优先检查用户必经且可能静默失败的排产启动/约束读取路径。
- B 轨道发布闸门仍缺人工与环境证据，不能声明发布完成。
