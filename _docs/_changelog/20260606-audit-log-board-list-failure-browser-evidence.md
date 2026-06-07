# 2026-06-06 AuditLogBoard 审计日志列表失败 Chromium 证据

## 变更

- `AuditLogBoard` 审计日志列表读取失败时新增 fail-loud 告警。
- 保留本地演示日志 fallback，但明确提示 `已显示本地演示日志`。
- 审计日志详情读取失败时不打开详情弹窗，并显示失败原因。
- 新增单元测试和真实 Chromium 用例覆盖列表失败路径。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志列表接口失败"
```

结果：单元 `3 passed`；Chromium `1 passed`。
