# QualityCapaTaskPanel 复用效果验证写入失败真实浏览器证据

日期：2026-06-06

## 目标

补齐质量 CAPA 闭环的真实 Chromium 失败态证据：正式 CAPA 已批准后，点击 `验证复用效果并回写` 时，如果 `aimes_quality_knowledge_reuse_closures` 写入失败，页面必须 fail-loud，并且不能把待验证 CAPA 伪造成已验证、不能伪造复用效果 trace 或 OTD 证据。

## 选片依据

- `QualityCapaTaskPanel.vue` 当前行覆盖率约 77.51%，低于全局 79.26%。
- 复用效果验证回写是质量知识闭环进入后续推荐排序、审计回放和 OTD 复盘的关键证据。
- 既有单元测试已覆盖该失败态，但真实浏览器此前主要覆盖成功长链路，缺少“不伪造复用效果回写”的 Chromium 证据。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`质量知识复用效果验证写入失败时真实浏览器展示 fail-loud 且不伪造效果回写`。
  - 预置质量知识样本、复用草案和 `approved` 状态正式 CAPA。
  - route `/api/v1/scheduling/quality-knowledge-evidence` GET 返回空数组，确保页面读取本地预置状态。
  - 在预置完成后让 `Storage.prototype.setItem` 对 `aimes_quality_knowledge_reuse_closures` 抛错，专门模拟验证回写失败。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用效果验证写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示已批准正式 CAPA：`WO-DEMO-1012 OP-10 同类首件尺寸偏差正式 CAPA`。
- 点击 `验证复用效果并回写` 后显示 `role="alert"`。
- alert 包含 `质量知识复用效果验证失败` 和 `reuse effect verification storage unavailable from chromium`。
- `.formal-capa-flow` 不进入 `verified` 状态。
- `验证复用效果并回写` 按钮仍可见，可重试。
- 不显示 `TRACE-KG-QA-WO-DEMO-1012-OP-10-REUSE-EFFECT`。
- 不显示 `已验证并回写复用效果` 成功消息。
- `localStorage.aimes_quality_knowledge_reuse_closures` 仍包含 `"status":"approved"`，不包含 `"status":"verified"`。
- `aimes_otd_evidence_chain` 不包含复用效果 trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
