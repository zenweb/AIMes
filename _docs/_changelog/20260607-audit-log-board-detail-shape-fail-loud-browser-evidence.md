# 2026-06-07 AuditLogBoard 审计详情坏形状 fail-loud Chromium 证据

## 变更

- 修复审计日志详情接口 `200` 但返回非详情对象时可能打开坏详情弹窗或触发渲染错误的问题。
- `openDetail` 增加 `AuditLogDetail` 运行时基本形状校验。
- 非详情对象统一抛出 `${auditId} 后端返回非对象审计详情载荷`。
- 新增 `AuditLogBoard` 组件单元测试覆盖审计详情坏形状。
- 新增 Audit e2e：`审计日志详情载荷非详情对象时真实浏览器不打开空弹窗并告警`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts -t "detail payload is not a detail object"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志详情载荷非详情对象"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
