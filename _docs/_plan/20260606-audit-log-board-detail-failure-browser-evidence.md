# Plan: AuditLogBoard 审计日志详情失败浏览器证据

## 成功标准

- 审计日志列表加载成功后，点击详情会真实请求详情 API。
- 详情 API 失败时页面显示 fail-loud 告警。
- 详情 API 失败时不打开空弹窗。
- 单元测试和真实 Chromium 目标用例通过。

## 执行

- 选片：`AuditLogBoard.vue` 行覆盖率约 76.92%，且审计日志详情是合规与安全签字复核入口。
- 范围：只处理审计日志详情失败态，不改 `AuditDecisionReplayPanel`。
- 实现：复用 `loadError` 告警，失败时保持 `detail = null`，新增单元测试和 e2e。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志详情接口失败"
```

结果：单元 `3 passed`；Chromium `1 passed`。
