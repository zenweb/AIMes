# Plan: AuditLogBoard 审计日志列表失败浏览器证据

## 成功标准

- 审计日志列表 API 失败时页面显示 fail-loud 告警。
- 本地演示日志可以展示，但必须明确标注为 fallback。
- 详情 API 失败时不打开空弹窗。
- 单元测试和真实 Chromium 目标用例通过。

## 执行

- 选片：`AuditLogBoard.vue` 行覆盖率约 76.92%，且审计日志是合规与安全签字复核入口。
- 范围：只处理审计日志列表/详情本体 fail-loud，不改 `AuditDecisionReplayPanel`。
- 实现：新增 `loadError`、alert UI、单元测试和 e2e。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志列表接口失败"
```

结果：单元 `3 passed`；Chromium `1 passed`。
