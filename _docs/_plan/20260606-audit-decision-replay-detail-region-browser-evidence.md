# 2026-06-06 AuditDecisionReplayPanel 回放详情区 Plan

## 成功标准

- 点击回放后，详情区在单测中具备 `role="region"`、`aria-live="polite"` 和标题关联。
- 真实 Chromium 场景能通过 `getByRole('region', { name: 'WO-RUSH-9001 急单插入重排建议 回放链' })` 找到详情区。
- 不修改审计回放业务逻辑。

## 执行

1. 读取审计回放组件、现有单测和 audit e2e。
2. 确认回放按钮已有上下文 `aria-label`，避免重复打磨。
3. 新增 RED 单测证明详情区缺少命名 region 语义。
4. 最小修改详情区 DOM 语义。
5. 升级 audit e2e 为真实角色定位证据。
6. 更新报告、changelog、review、todo、issue、plan。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
- B 轨道发布闸门未纳入本片完成标准。
