# 2026-06-07 AuditLogBoard 审计列表单项坏形状 fail-loud Chromium 证据

## 变更

- 修复审计日志列表接口 `200` 且 `items` 是数组但单项缺字段时可能渲染坏日志项的问题。
- `load` 增加单条 `AuditLog` 基本形状校验。
- 非日志对象统一抛出 `${auditId} 后端返回非对象审计日志载荷`。
- 新增 `AuditLogBoard` 组件单元测试覆盖审计列表单项坏形状。
- 新增 Audit e2e：`审计日志列表单项载荷坏形状时真实浏览器展示本地演示日志 fail-loud`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts -t "one audit list item is not a log object"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "列表单项载荷坏形状"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
