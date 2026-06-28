# 2026-06-14 Plan - Schedule Pareto Compare Missing Items List Fail-Loud

## 目标
- 将多目标对比缺少顶层方案列表时的 JS TypeError 改为业务可读 fail-loud。

## 范围
- 只修改 ParetoCompare 顶层后端结果合同校验。
- 新增一个单元测试和一个真实 Chromium e2e。
- 不改变后端，不扩大新功能。

## 执行步骤
- 写 RED：缺少 `items` 时期望 `后端对比结果缺少方案列表` 且不出现 `Cannot read`。
- 加最小守卫：`if (!Array.isArray(result.items)) throw new Error(...)`。
- 跑窄测、全量相关测试、覆盖率和收尾扫描。

## 完成标准
- 弹窗展示 `role="alert"` 告警。
- 空态、推荐卡片、采用按钮均不渲染。
- 单元、真实 Chromium、覆盖率全部通过。
