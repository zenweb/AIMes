# 2026-06-14 Plan - Purchase 详情陈旧告警清理

## 成功标准
- 启动证据同步失败告警存在时，采购详情首次加载失败必须明确告警。
- 后续成功选择另一张采购单后，旧的详情失败告警必须消失。
- 启动证据同步 fail-loud 必须继续保留。
- 不新增采购功能，只硬化现有详情选择路径。

## 执行
1. 添加 RED 单测，复现启动告警在前时详情失败告警成功后残留。
2. 最小修复通知状态，将启动告警与当前操作告警拆开维护。
3. 添加 Chromium 真实浏览器用例，模拟供应网络启动证据失败、第一张采购详情失败、第二张采购详情成功。
4. 回跑 focused unit、focused Chromium、Purchase 单测、Purchase Chromium 全文件、全量 unit coverage。

## 验证结果
- RED 已观察到：旧代码在第二次详情成功后仍显示 `采购订单详情加载失败`。
- GREEN：Purchase 单测、Purchase Chromium e2e、全量 unit coverage 均通过。
