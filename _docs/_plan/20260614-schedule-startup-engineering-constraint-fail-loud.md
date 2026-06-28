# 2026-06-14 Plan - 排产启动工程约束 Fail-Loud

## 成功标准
- 启动工程约束证据读取失败时，排产页面必须显示明确告警。
- 正式排产主数据必须继续加载并能被真实浏览器验证。
- 不新增功能，只硬化现有排产用户关键路径。

## 执行
1. 添加 RED 单测，证明旧代码会阻断 `getCurrentPlan`。
2. 最小修复 mounted 启动流程，将 BOM/ECN 与工艺能力约束读取改为逐项 fail-loud。
3. 添加真实浏览器证据，模拟工程约束证据 API 与本地存储不可用。
4. 回跑 focused unit、focused Chromium、全量 unit coverage。
5. 记录全量 scheduling Chromium 的残留 dhtmlx 失败，不隐藏非绿项。

## 验证结果
- RED 已观察到：旧代码 mounted hook unhandled rejection，`getCurrentPlan` 未调用。
- GREEN：排产单测 27 passed。
- GREEN：focused scheduling Chromium 1 passed。
- GREEN：全量 unit coverage 105 files / 684 tests passed。
- RED：scheduling Chromium 全文件仍有 4 个真实 dhtmlx 残留失败，下一片继续追。
