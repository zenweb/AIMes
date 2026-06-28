# 2026-06-14 Review - 多目标推荐分数组成后端契约

## 结论
- 未发现阻断问题。
- 推荐卡现在同时展示后端总分和后端分项贡献，真实路径不再靠前端 KPI 文案解释总分。

## 已检查
- DTO/API 契约：`RecommendationScoreBreakdown` 随 `ObjectiveCompareItem` 返回。
- 后端计算：`RecommendationScore` 由 breakdown 汇总，公式仍为利用率 40% + 准时率 40% + 换线效率 20%。
- 前端校验：缺总分或缺 breakdown 均 fail-loud。
- 前端一致性：总分与 breakdown 求和不一致时 fail-loud。
- 浏览器证据：真实 Chromium 下推荐卡显示贡献值，采纳反馈失败告警仍保留。

## 残余风险
- 当前后端集成测试验证 breakdown 存在且贡献非负；精确公式等值仍主要由应用服务实现与前端一致性校验兜底。
- 工作树包含大量历史/并行改动，本审计只覆盖本片涉及文件。
