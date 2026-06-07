# 2026-06-07 AuditDecisionReplayPanel 助手动作审计坏载荷 fail-loud Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理助手动作审计非数组载荷的证据。
- 约束：不扩新功能，只修复既有 AI 助手动作审计路径的可靠性和证据完整性。

## 发现

- `AuditDecisionReplayPanel` 单元测试已覆盖助手动作审计 backend-first 返回非数组载荷时的 `助手动作审计加载失败` 告警。
- 真实浏览器红灯显示：`/api/v1/scheduling/assistant-action-audits` 返回 `{ items: [] }` 时，页面没有 `.replay-sync-alert`。
- 根因：`readAssistantActionAuditsBackendFirst()` 依赖 TypeScript 泛型类型，缺少运行时 `Array.isArray` 校验；200 响应的非数组载荷会被当作空结果并 fallback 到本地审计。

## 处理

- `queryAssistantActionAudits(take, { failLoud })` 支持 fail-loud 模式，默认仍保持旧的空数组 fallback。
- `readAssistantActionAuditsBackendFirst({ failLoud })` 透传 fail-loud 选项。
- `readAssistantActionAuditsBackendFirst()` 增加运行时数组校验，非数组时抛出 `后端返回非数组审计载荷`。
- `AuditDecisionReplayPanel` 读取助手动作审计时启用 `{ failLoud: true }`。
- 新增 e2e：`助手动作审计载荷非数组时真实浏览器保留基础回放并告警`。

## 证据

- 红灯：新增 e2e 首次运行失败，真实 Chromium 下没有 `.replay-sync-alert`。
- 过程：首次修复只覆盖 API rejection，未覆盖 200 + 非数组载荷；同一 e2e 仍红。
- 绿灯：补运行时数组校验后，同一 e2e 通过。
- 页面验证：
  - 基础回放卡片 `WO-RUSH-9001 急单插入重排建议` 仍可见。
  - `.replay-sync-alert` 展示 `助手动作审计加载失败`。
  - 告警包含 `后端返回非数组审计载荷`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/assistant-action-audit.test.ts
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "assistant action audit payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "助手动作审计载荷非数组"
```

结果：助手动作审计工具单元 `8 passed`；组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据和对应 fail-loud 修复。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
