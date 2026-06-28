# 2026-06-14 Issue - 灰度等待不应阻塞当前证据推进

## Problem
- 15 天灰度观察需要墙钟时间，继续把它放在当前循环里会导致等待型空转。
- 同时，前端测试切片不能消除灰度观察这种外部时间窗口要求。

## Decision
- 按 owner 指令跳过/后置灰度观察等待。
- 当前继续推进现有功能精品化和真实浏览器证据。
- release gate 报告使用 `-DeferGrayObservation`，把状态写成 `PASS_WITH_DEFERRED_GRAY_OBSERVATION`。

## Resolution
- 已生成 `_docs/_reports/release-gate-audit-20260614-gray-skipped-continue.md`。
- 已继续推进 `ChatPanel` CNC 停机问答真实浏览器证据。
- 已补充 `ChatPanel` 来源分数越界夹紧测试，防止后端脏数据显示为 `170%` 或 `-40%` 这类误导性证据置信度。
