# 2026-06-06 ChatPanel 等待回复状态 Plan

## 成功标准

- 等待回复 typing 指示器在单测中具备 `role="status"`、`aria-live="polite"` 和明确可访问名称。
- 真实 Chromium 场景能在知识问答请求 pending 时验证 typing status，然后释放响应并看到助手回复。
- 不修改问答业务逻辑。

## 执行

1. 读取 `ChatPanel.vue`、既有 ChatPanel 单测和 chat e2e。
2. 避免重复已覆盖的 dialog/log/error/action status 路径。
3. 新增 RED 单测证明 typing loading 缺少 status 语义。
4. 最小修改 loading 指示器 DOM。
5. 补真实 Chromium pending 状态断言。
6. 更新报告、changelog、review、todo、issue、plan。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例最终通过。
- B 轨道发布闸门未纳入本片完成标准。
