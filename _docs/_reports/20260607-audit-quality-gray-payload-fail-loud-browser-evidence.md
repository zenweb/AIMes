# 2026-06-07 AuditDecisionReplayPanel 质量灰度决策坏载荷 fail-loud Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理质量灰度决策 200 非数组载荷的证据。
- 约束：不扩新功能，只硬化既有质量灰度发布审计路径的可靠性和证据完整性。

## 发现

- 组件单元测试已覆盖 `readQualityKnowledgeGrayReleaseDecisionRecordsBackendFirst()` 返回非数组时的 `质量灰度决策加载失败` 告警。
- 真实浏览器证据缺口：此前只有质量灰度决策接口 503 失败用例，没有覆盖 200 返回 `{ items: [] }` 的坏载荷形态。
- 根因风险：质量知识证据接口使用 TypeScript 泛型接收数组，但运行时若返回非数组，缺少显式数组守卫会让坏载荷被当作空结果处理，进而可能回退本地记录。

## 处理

- `readQualityKnowledgeEvidencePayloads()` 增加运行时 `Array.isArray(records)` 校验。
- 非数组载荷抛出 `后端返回非数组审计载荷`。
- 新增工具单元：质量灰度决策后端返回非数组载荷时 fail-loud。
- 新增 e2e：`质量灰度决策载荷非数组时真实浏览器保留基础回放并告警`。

## 证据

- 红灯：按 `质量灰度决策载荷非数组` 运行 e2e 时，初始状态无匹配用例，说明真实浏览器证据尚未建立。
- 绿灯：补用例和运行时数组校验后，真实 Chromium 验证通过。
- 页面验证：
  - 基础回放卡片 `WO-RUSH-9001 急单插入重排建议` 仍可见。
  - 基础回放卡片 `M-AL-6061 收货后释放冻结工序` 仍可见。
  - `.replay-sync-alert` 展示 `质量灰度决策加载失败`。
  - 告警包含 `后端返回非数组审计载荷`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts -t "non-array payload"
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "quality gray release decisions are not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "质量灰度决策载荷非数组"
```

结果：质量知识同步工具定向单元 `1 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
