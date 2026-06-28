# 2026-06-14 Plan - BOM 启动工程证据 Fail-Loud

## 成功标准
- 启动工程证据读取失败时，BOM 页面必须显示明确告警。
- BOM 主列表必须继续加载并可被真实浏览器操作。
- 不新增功能，只硬化现有 BOM 用户关键路径。

## 执行
1. 添加 RED 单测，证明旧代码会阻断 `getBomList`。
2. 最小修复 mounted 启动流程，将三类工程证据读取改为逐项 fail-loud。
3. 添加真实浏览器证据，模拟 ECN 工程证据 API 与本地存储均不可用。
4. 回跑 focused unit、focused Chromium、工程数据 Chromium 全文件、全量 unit coverage。

## 验证结果
- RED 已观察到：旧代码 mounted hook unhandled rejection，`getBomList` 未调用。
- GREEN：BOM 单测、工程数据 Chromium e2e、全量 unit coverage 均通过。
