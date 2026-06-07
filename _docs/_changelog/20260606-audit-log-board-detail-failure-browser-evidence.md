# 2026-06-06 AuditLogBoard 审计日志详情失败 Chromium 证据

## 变更

- `AuditLogBoard` 审计日志详情读取失败时显示 fail-loud 告警。
- 详情接口失败时不再打开空详情弹窗。
- 新增单元测试和真实 Chromium 用例覆盖详情失败路径。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志详情接口失败"
```

结果：单元 `3 passed`；Chromium `1 passed`。
