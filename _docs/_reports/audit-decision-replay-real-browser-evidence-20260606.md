# AuditDecisionReplayPanel 真实浏览器证据刷新

日期：2026-06-06

## 范围

- 组件：`src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- 证据类型：项目 Playwright Chromium e2e
- 目标：确认审计决策回放在生产构建下可真实交互，避免只依赖组件单测。

## 当前证据

命令：

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts
```

结果：

- Nuxt production build 成功。
- Chromium 执行 `tests/e2e/audit.spec.ts`。
- 12/12 passed。
- 覆盖路径包括：AI 建议/人工采纳回放、客户 POC 证据、统一 OTD 复盘证据、后端 Agent execute 业务落库证据、配置审批、质量推荐实验、POC 复盘签署、知识治理复核、质量推荐采纳、R3 重新灰度发布。
- 最大 JS chunk：817.50 kB。

## 结论

`AuditDecisionReplayPanel` 当前真实浏览器关键路径可用。本轮没有发现需要继续试错修复的浏览器失败。该组件分支覆盖低主要来自大量映射分支和证据类型，而不是当前浏览器链路不可用。

## 发布闸门

本证据只证明本地真实 Chromium 下的审计回放路径，不证明 Hosted CI、staging/PostgreSQL 演练、Attack Chain 人工验证、安全签字或灰度观察窗口。
