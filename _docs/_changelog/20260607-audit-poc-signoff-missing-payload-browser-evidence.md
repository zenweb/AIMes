# 2026-06-07 AuditDecisionReplayPanel POC 复盘签署载荷缺失 Chromium 证据

## 变更

- 新增 Audit e2e：`POC 复盘签署载荷缺失时真实浏览器保留基础回放并告警`。
- 验证后端返回 POC 复盘签署记录但缺少审计回放必要字段时，页面 fail-loud 且不生成不可信签署回放卡片。
- 显式关闭 offline demo，并将无关审计依赖 mock 为成功空响应，保证断言聚焦 POC 签署异常。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "POC 复盘签署载荷缺失"
```

结果：Nuxt production build passed，Chromium `1 passed`。
