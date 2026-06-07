# 2026-06-07 AuditDecisionReplayPanel 质量灰度决策坏载荷 fail-loud Chromium 证据

## 变更

- 修复质量知识证据 200 非数组载荷在审计回放中可能被静默 fallback 的问题。
- `readQualityKnowledgeEvidencePayloads` 增加运行时数组校验。
- 非数组载荷统一抛出 `后端返回非数组审计载荷`。
- 新增质量知识同步工具定向单元测试覆盖质量灰度决策非数组载荷。
- 新增 Audit e2e：`质量灰度决策载荷非数组时真实浏览器保留基础回放并告警`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts -t "non-array payload"
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "quality gray release decisions are not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "质量灰度决策载荷非数组"
```

结果：质量知识同步工具定向单元 `1 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
