# 2026-06-06 Admin 治理证据加载隔离真实浏览器证据

## 目标

修复 Knowledge 真实浏览器套件中跨页进入 `Admin -> Agent 治理` 后读不到质量知识灰度/实验候选证据的问题，避免一个治理证据源读取失败阻断后续用户关键证据。

## 变更

- 在 `src/frontend/src/components/admin/AdminBoard.vue` 增加 `loadAdminEvidenceItem`。
- 将 Admin 初始化时的治理证据加载改为逐项隔离，并通过 `Promise.all` 并行加载。
- 单个证据源失败时记录到 `notification`，页面显示 `部分治理证据刷新失败...`。
- 其它可用证据继续进入 Agent 治理面，不再因早期 backend-first 读取失败而让质量灰度监控和实验候选显示为 `0 条`。

## 验证

- PASS：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "知识复核写入失败|R3 调整范围|R5 回滚后的 R6"`
  - Production Nuxt build completed.
  - Chromium: 3/3 passed.
- PASS：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "R3 调整范围|R5 回滚后的 R6"`
  - Production Nuxt build completed.
  - Chromium: 2/2 passed.
- PASS：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts -g "知识复核写入失败"`
  - Chromium: 1/1 passed.
- PASS：`npx.cmd eslint src/components/admin/AdminBoard.vue --max-warnings 0`
- PASS：`npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts`
  - Production Nuxt build completed.
  - Chromium: 15/15 passed.

## 结论

Admin 跨页证据加载断点已用定向真实 Chromium 用例证明修复，整份 Knowledge 套件也已拿到稳定全量 PASS 证据。本结论只覆盖 Knowledge 前端真实浏览器证据，不覆盖发布 B 轨闸门。
