# 2026-06-06 Admin 治理证据加载隔离

- 修复 `AdminBoard` 初始化治理证据时一个 backend-first 证据源失败会中断后续证据加载的问题。
- 增加逐项加载隔离和 fail-loud `notification`，保留其它可用治理证据。
- 用真实 Chromium 定向验证 `R3 调整范围` 与 `R5 回滚后的 R6` 两条 Knowledge -> Admin 治理链路通过。
- 合并定向复跑 `知识复核写入失败|R3 调整范围|R5 回滚后的 R6`，Chromium 3/3 passed。
- 定向 ESLint 验证 `AdminBoard.vue` 通过。
- 复跑整份 `knowledge.spec.ts`，生产构建后的 Chromium 15/15 passed。
