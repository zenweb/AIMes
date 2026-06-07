# QualityCapaTaskPanel 复用草案转正式 CAPA 写入失败真实浏览器证据

日期：2026-06-06

## 目标

补齐质量 CAPA 闭环的真实 Chromium 失败态证据：质量知识复用草案在转正式 CAPA 时，如果 `aimes_quality_knowledge_reuse_closures` 写入失败，页面必须 fail-loud，并且不能伪造正式 CAPA 记录、trace 或 OTD 证据。

## 选片依据

- `QualityCapaTaskPanel.vue` 当前行覆盖率约 77.51%，低于全局 79.26%。
- 质量知识复用转正式 CAPA 是质量闭环、审计回放、OTD 复盘和 AI 推荐可信度的关键链路。
- 既有单元测试已覆盖该失败态，但真实浏览器此前主要覆盖成功长链路，缺少“不伪造正式 CAPA”的 Chromium 证据。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`质量知识复用转正式 CAPA 写入失败时真实浏览器展示 fail-loud 且不伪造正式 CAPA`。
  - 预置质量知识样本和复用草案。
  - route `/api/v1/scheduling/quality-knowledge-evidence` GET 返回空数组，确保页面读取本地预置草案。
  - 在真实浏览器中让 `Storage.prototype.setItem` 对 `aimes_quality_knowledge_reuse_closures` 抛错。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量知识复用转正式 CAPA 写入失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- `.quality-capa-panel` 展示预置草案 `WO-DEMO-1012 匹配 92%`。
- 点击 `复核草案并转正式 CAPA` 后显示 `role="alert"`。
- alert 包含 `质量知识复用转正式 CAPA 失败` 和 `reuse closure storage unavailable from chromium`。
- 页面保留 `草案待质量工程师复核` 与原按钮。
- 不显示 `TRACE-KG-QA-WO-DEMO-1012-OP-10-FORMAL-CAPA`。
- 不显示 `已转正式 CAPA` 成功消息。
- `localStorage.aimes_quality_knowledge_reuse_closures` 保持 `null`。
- `aimes_otd_evidence_chain` 不包含正式 CAPA trace。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
