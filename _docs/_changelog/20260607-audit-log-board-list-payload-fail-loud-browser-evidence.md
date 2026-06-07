# 2026-06-07 AuditLogBoard 审计列表坏载荷 fail-loud Chromium 证据

## 变更

- 修复审计日志列表接口 `200` 但 `items` 非数组时可能渲染坏日志集合的问题。
- `load` 增加 `result.items` 运行时数组校验。
- 非数组载荷统一抛出 `后端返回非数组审计日志载荷`。
- 新增 `AuditLogBoard` 组件单元测试覆盖审计列表坏载荷。
- 新增 Audit e2e：`审计日志列表载荷非数组时真实浏览器展示本地演示日志 fail-loud`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-log-board.test.ts -t "audit list payload is not an array"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "审计日志列表载荷非数组"
```

结果：组件定向单元 `1 passed`；Nuxt production build passed，Chromium `1 passed`。
