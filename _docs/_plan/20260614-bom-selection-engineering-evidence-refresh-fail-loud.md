# 2026-06-14 Plan - BOM 选择工程证据刷新 Fail-Loud

## 成功标准
- 选择 BOM 时，三类工程证据刷新失败必须显示明确告警。
- 所选 BOM 详情必须继续加载，真实浏览器里能看到详情标题与排产约束源。
- 不新增 BOM 功能，只硬化现有选择详情路径。

## 执行
1. 添加 RED 单测，证明旧代码在工程证据刷新失败时不会调用 `getBomById`。
2. 最小修复 `selectBom()`，将工程证据刷新改为逐项 fail-loud 聚合。
3. 添加 Chromium 真实浏览器用例，模拟选择 BOM 时 ECN 影响分析刷新失败。
4. 回跑 focused unit、BOM 单测、focused Chromium、工程数据 Chromium 全文件、全量 unit coverage。

## 验证结果
- RED 已观察到：旧代码未调用 `getBomById`，并出现工程证据刷新 unhandled rejection。
- GREEN：BOM 单测、工程数据 Chromium e2e、全量 unit coverage 均通过。
