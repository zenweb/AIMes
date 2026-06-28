# 2026-06-14 ChatPanel 稀疏来源分数归一化

## 变更
- 在 `ChatPanel.vue` 接收知识问答结果后，对 `sources[].relevanceScore` 做渲染前归一化。
- 后端返回稀疏来源或非法分数时，证据来源区显示 `0%`，不再出现 `NaN%`。
- 新增单元测试和 Chromium 真实浏览器测试覆盖该证据展示路径。

## 验证
- RED 单测确认旧行为显示 `NaN%`。
- RED Chromium e2e 确认真实浏览器旧行为显示 `NaN%`。
- 修复后：
  - `npm run test:unit -- tests/unit/chat-panel.test.ts`
  - `npm run test:e2e -- tests/e2e/chat.spec.ts --project=chromium`
  - `npm run test:unit:coverage`

## 说明
- 15 天灰度观察已按负责人指令从当前执行门槛中移除，后续单独追踪。
