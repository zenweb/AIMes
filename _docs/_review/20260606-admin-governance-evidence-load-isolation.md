# Review: Admin 治理证据加载隔离

## 结论

本轮修复解决了真实 Chromium 暴露的 Admin 治理证据加载短路问题。定向失败用例已回归通过。

## 已核对

- 修复点集中在 `AdminBoard` 初始化证据读取，不扩大新功能范围。
- 每个证据源单独捕获错误，失败会在页面 alert 中显式暴露。
- 质量知识灰度监控与实验候选不再被其它证据源失败阻断。
- 定向 Chromium 用例覆盖 `回滚到 R2`、`补样已合并` 两个此前失败断言。
- 合并定向 Chromium 覆盖 `知识复核写入失败`、`R3 调整范围`、`R5 回滚后的 R6`，3/3 passed。
- `npx.cmd eslint src/components/admin/AdminBoard.vue --max-warnings 0` 通过。
- 整份 `npm.cmd run test:e2e -- tests/e2e/knowledge.spec.ts` 已在生产构建后的 Chromium 中 15/15 passed。

## 残余风险

- `AdminBoard.vue` 工作区已有较多既有改动，本轮只确认了证据加载隔离相关行为。
- 发布 B 轨仍未关闭：Hosted CI、PostgreSQL/staging、攻击链人工验证、安全签字、14 天灰度观察仍缺证据。
