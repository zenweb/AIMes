# 2026-06-14 Review: ChatPanel 稀疏来源分数归一化

## 结论
- 通过。

## 覆盖路径
- 知识问答后端返回 `sources`，但某条来源缺少 `relevanceScore`。
- ChatPanel 展开“参考来源”时必须展示可解释百分比，不能出现 `NaN%`。

## 风险复核
- 改动范围只在 ChatPanel 渲染前归一化来源分数。
- 未改变知识问答 API 调用、离线演示回答、动作执行或审计链路。
- 分数被夹在 `0..1`，避免异常值污染 UI。

## 验证记录
- `tests/unit/chat-panel.test.ts`：44 passed。
- `tests/e2e/chat.spec.ts --project=chromium`：37 passed。
- `test:unit:coverage`：105 files / 687 tests passed，全局 lines 83.14%，ChatPanel lines 72.12%。
